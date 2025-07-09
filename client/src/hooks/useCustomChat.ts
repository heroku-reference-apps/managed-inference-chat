import React, { useRef, useState } from 'react';
import { Message, ChatError, StreamChunk, UseCustomChatProps } from '@/types/chat';
import { secureRequest } from '@/lib/apiSecurity';

const filterMessages = (messages: Message[]) => {
  return messages.filter(
    msg => msg.type !== 'image' && msg.role !== 'agent' && msg.content.trim() !== ''
  );
};

export function useCustomChat({ model, reasoning, agents, historyLimit = 6 }: UseCustomChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<ChatError | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const clearMessages = (newMessages: Message[] | ((prev: Message[]) => Message[])) => {
    const finalMessages = typeof newMessages === 'function' ? newMessages(messages) : newMessages;
    setMessages(finalMessages);
    if (finalMessages.length === 0) {
      setError(null);
      setStatus('idle');
    }
  };

  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setStatus('idle');
    }
  };

  const handleChatRequest = async (messageContent: string, previousMessages: Message[]) => {
    const userMessage: Message = { role: 'user', content: messageContent };
    setMessages(prev => [...prev, userMessage]);
    setError(null);
    setStatus('loading');

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      // Filter out agent messages when sending to server
      const filteredMessages = filterMessages([...previousMessages, userMessage]);
      const recentMessages = filteredMessages.slice(-historyLimit);

      const requestBody = JSON.stringify({
        messages: recentMessages,
        model,
        reasoning,
        agents,
      });

      const response = await secureRequest('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || errorData.error || `Request failed with status ${response.status}`
        );
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let accumulatedReasoning = '';
      let seenToolCallIds = new Set<string>();
      let toolMessagesByCallId = new Map<string, string>();

      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.replace(/^data:\s?/, '');

            if (data === '[DONE]') continue;

            try {
              const chunk: StreamChunk = JSON.parse(data);

              // Do nothing with tool messages
              if (
                chunk.choices[0]?.delta?.role === 'tool' ||
                chunk.choices[0]?.message?.role === 'tool'
              ) {
                continue;
              }

              const content =
                chunk.choices[0]?.delta?.content || chunk.choices[0]?.message?.content;
              const reasoningDelta =
                chunk.choices[0]?.delta?.reasoning?.thinking ||
                chunk.choices[0]?.message?.reasoning?.thinking;
              const toolCallsDelta =
                chunk.choices[0]?.delta?.tool_calls || chunk.choices[0]?.message?.tool_calls;

              // Handle tool calls - create separate messages for each tool call
              if (toolCallsDelta != null) {
                const newToolCalls = toolCallsDelta.filter(
                  newTool => !seenToolCallIds.has(newTool.id)
                );

                for (const toolCall of newToolCalls) {
                  seenToolCallIds.add(toolCall.id);
                  toolMessagesByCallId.set(toolCall.id, '');

                  // Create a separate agent message for each tool call
                  const agentMessage: Message = {
                    role: 'agent',
                    content: toolCall.function?.name || `Tool call: ${toolCall.id}`,
                    is_tool_message: true,
                    tool_calls: [toolCall],
                  };

                  setMessages(prev => [...prev, agentMessage]);
                }

                // If we have content and tool calls, this content is for the tool message
                if (content != null && toolCallsDelta.length > 0) {
                  // For now, assume content applies to the last tool call
                  const lastToolCall = toolCallsDelta[toolCallsDelta.length - 1];
                  if (lastToolCall && toolMessagesByCallId.has(lastToolCall.id)) {
                    const existingContent = toolMessagesByCallId.get(lastToolCall.id) || '';
                    const newContent = existingContent + content;
                    toolMessagesByCallId.set(lastToolCall.id, newContent);

                    // Update the agent message with the new content
                    setMessages(prev => {
                      const newMessages = [...prev];
                      // Find the agent message for this tool call (should be recent)
                      for (let i = newMessages.length - 1; i >= 0; i--) {
                        const msg = newMessages[i];
                        if (
                          msg.role === 'agent' &&
                          msg.is_tool_message &&
                          msg.tool_calls?.[0]?.id === lastToolCall.id
                        ) {
                          newMessages[i] = {
                            ...msg,
                            content: newContent,
                          };
                          break;
                        }
                      }
                      return newMessages;
                    });
                  }
                }
              }

              // Handle content for assistant messages
              if (content != null) {
                // If we have content and it's not part of tool calls, add it to assistant message
                if (toolCallsDelta == null) {
                  accumulatedContent += content;
                }

                if (reasoningDelta != null) {
                  accumulatedReasoning += reasoningDelta;
                }

                // Only create/update assistant message if we have content and no tool calls
                if ((accumulatedContent || accumulatedReasoning) && toolCallsDelta == null) {
                  const assistantMessage: Message = {
                    role: 'assistant',
                    content: accumulatedContent || '',
                    reasoning:
                      accumulatedReasoning.trim() !== ''
                        ? { thinking: accumulatedReasoning }
                        : undefined,
                  };

                  setMessages(prev => {
                    const lastAssistantIndex = prev.findLastIndex(msg => msg.role === 'assistant');

                    // If we have an assistant message and it's the last one, update it
                    if (lastAssistantIndex !== -1 && lastAssistantIndex === prev.length - 1) {
                      const newMessages = [...prev];
                      newMessages[lastAssistantIndex] = assistantMessage;
                      return newMessages;
                    }

                    // Otherwise append the assistant message
                    return [...prev, assistantMessage];
                  });
                }
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }

      setStatus('idle');
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setStatus('idle');
          return;
        }

        // Check for model not supported errors
        const errorMessage = err.message.toLowerCase();
        if (
          errorMessage.includes('invalid model') ||
          errorMessage.includes('failed to fetch from model') ||
          errorMessage.includes('model not found') ||
          errorMessage.includes('not provisioned')
        ) {
          setError({
            message: `The model "${model}" is not enabled, please provision it on Heroku Managed Inference and Agents`,
          });
        } else {
          setError({ message: err.message });
        }
      } else {
        setError({ message: 'An unknown error occurred' });
      }
      setStatus('error');
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;
    await handleChatRequest(input, messages);
    setInput('');
  };

  const reload = async () => {
    if (messages.length > 0 && status !== 'loading') {
      const lastUserMessageIndex = messages.findLastIndex(msg => msg.role === 'user');
      if (lastUserMessageIndex !== -1) {
        const lastUserMessage = messages[lastUserMessageIndex];
        // Keep all messages up to (but not including) the last user message
        const updatedMessages = messages.slice(0, lastUserMessageIndex);
        setMessages(updatedMessages);
        setStatus('loading'); // Set loading state immediately
        await handleChatRequest(lastUserMessage.content, updatedMessages);
      }
    }
  };

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    error,
    status,
    stop,
    reload,
    setMessages: clearMessages,
    setInput,
  };
}
