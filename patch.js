const fs = require('fs');

const file = 'src/features/ai/chat/ChatMessage.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `    // Helper function to format timestamp
    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        return \`\${hours}:\${minutesStr} \${ampm}\`;
    };

    const timestamp = message.created_at ? formatTime(message.created_at) : '';

    return (
        <div className={cn(
            "flex w-full px-4 py-2", // Reduced padding for bubble style
            isUser ? "justify-end" : "justify-start"
        )}>
            <div className={cn(
                "flex max-w-[85%] md:max-w-[75%] gap-2",
                isUser ? "flex-row-reverse" : "flex-row"
            )}>
                <div className="flex-shrink-0 mt-1">
                    {isUser ? (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600">
                            <User className="h-5 w-5 text-white" />
                        </div>
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
                            <img src="/mindflow-icon.svg" alt="AI" className="h-5 w-5" />
                        </div>
                    )}
                </div>

                <div className={cn(
                    "relative flex flex-col min-w-0 rounded-2xl px-4 py-3 shadow-sm",
                    isUser
                        ? "bg-indigo-600 text-white rounded-tr-sm"
                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-sm"
                )}>
                    <div className={cn(
                        "prose prose-sm md:prose-base max-w-none break-words",
                        isUser ? "prose-invert" : "dark:prose-invert"
                    )}>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={{
                                a: ({ node, ...props }) => <a {...props} className={cn(isUser ? "text-indigo-200 hover:text-white" : "text-indigo-600 hover:text-indigo-500 dark:text-indigo-400")} target="_blank" rel="noopener noreferrer" />,
                                table: ({ node, ...props }) => <div className="overflow-x-auto my-4"><table className={cn("min-w-full divide-y rounded-lg border", isUser ? "divide-indigo-400 border-indigo-400" : "divide-gray-300 dark:divide-gray-700 border-gray-200 dark:border-gray-800")} {...props} /></div>,
                                thead: ({ node, ...props }) => <thead className={isUser ? "bg-indigo-700/50" : "bg-gray-50 dark:bg-gray-800/80"} {...props} />,
                                tbody: ({ node, ...props }) => <tbody className={cn("divide-y", isUser ? "divide-indigo-400 bg-indigo-600" : "divide-gray-200 dark:divide-gray-800 bg-white dark:bg-slate-900")} {...props} />,
                                tr: ({ node, ...props }) => <tr className={cn("transition-colors", isUser ? "hover:bg-indigo-700/50" : "hover:bg-gray-50 dark:hover:bg-gray-800/50")} {...props} />,
                                th: ({ node, ...props }) => <th className={cn("px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider", isUser ? "text-indigo-100" : "text-gray-900 dark:text-gray-100")} {...props} />,
                                td: ({ node, ...props }) => <td className={cn("px-3 py-4 text-sm whitespace-pre-wrap", isUser ? "text-indigo-50" : "text-gray-700 dark:text-gray-300")} {...props} />,
                                code({ node, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return match ? (
                                        <SyntaxHighlighter
                                            {...props}
                                            style={vscDarkPlus}
                                            language={match[1]}
                                            PreTag="div"
                                            className="rounded-md my-4 shadow-sm"
                                        >
                                            {String(children).replace(/\\n$/, '')}
                                        </SyntaxHighlighter>
                                    ) : (
                                        <code {...props} className={cn("px-1.5 py-0.5 rounded-md text-sm", isUser ? "bg-indigo-700 text-white" : "bg-gray-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400", className)}>
                                            {children}
                                        </code>
                                    );
                                },
                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />
                            }}
                        >
                            {message.content + (isGenerating ? " ●" : "")}
                        </ReactMarkdown>
                    </div>

                    <div className={cn(
                        "flex items-center mt-1 space-x-2 text-[10px]",
                        isUser ? "justify-end text-indigo-200" : "justify-between text-gray-500 dark:text-gray-400"
                    )}>
                        {/* Action Bar for AI Messages */}
                        {!isUser && message.content && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handleCopy}
                                    className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    title="Copy message"
                                >
                                    {isCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                </button>
                                <button
                                    onClick={handleTTS}
                                    className={cn(
                                        "rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                                        isPlaying && "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                                    )}
                                    title={isPlaying ? "Stop listening" : "Listen"}
                                >
                                    <Volume2 className="h-3 w-3" />
                                </button>
                                {onRegenerate && (
                                    <button
                                        onClick={onRegenerate}
                                        className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        title="Regenerate response"
                                    >
                                        <RotateCcw className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                        )}
                        {/* Timestamp */}
                        {timestamp && (
                            <span className={cn(
                                "flex-shrink-0",
                                !isUser && "ml-auto" // Push timestamp to right in AI bubble
                            )}>
                                {timestamp}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};`;

content = content.replace(/    return \([\s\S]*?\);\n\};/, replacement);

fs.writeFileSync(file, content);
