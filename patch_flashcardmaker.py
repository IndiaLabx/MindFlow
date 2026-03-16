import re

with open('src/features/tools/flashcard-maker/FlashcardMaker.tsx', 'r') as f:
    content = f.read()

# Replace root div classes to be 100dvh instead of calc(100vh-64px)
content = content.replace('className="flex flex-col h-[calc(100vh-64px)] w-full overflow-hidden font-sans"', 'className="flex flex-col h-[100dvh] w-full overflow-hidden font-sans bg-gray-50 dark:bg-gray-900"')

# Improve Header visual feel (Native app style - slightly more padding, no bottom border, light drop shadow)
old_header = 'className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center gap-2"'
new_header = 'className="bg-white dark:bg-gray-800 shadow-sm z-10 px-4 py-3 flex items-center gap-3 pt-[env(safe-area-inset-top,0.75rem)]"'
content = content.replace(old_header, new_header)

old_back_btn = 'className="p-2 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-slate-800 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"'
new_back_btn = 'className="p-2 -ml-2 hover:bg-gray-100 active:bg-gray-200 dark:bg-gray-800 dark:hover:bg-slate-700 dark:active:bg-slate-600 rounded-full text-gray-700 dark:text-gray-200 transition-colors"'
content = content.replace(old_back_btn, new_back_btn)

# Make sure title is slightly bolder and bigger for Android feel
content = content.replace('<h1 className="text-lg font-bold text-gray-900 dark:text-white">Flashcard Image Maker</h1>', '<h1 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">Flashcard Image Maker</h1>')

# Update Bottom Tab Bar for Mobile
old_tabbar = 'className="h-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex text-gray-500 dark:text-gray-400"'
new_tabbar = 'className="h-16 pb-[env(safe-area-inset-bottom)] bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex text-gray-500 dark:text-gray-400 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-10"'
content = content.replace(old_tabbar, new_tabbar)

# Update Tab buttons for Native Feel (ripple effect via active state)
old_editor_tab = 'className={`flex-1 flex flex-col items-center justify-center gap-1 ${activeTab === \'editor\' ? \'text-indigo-600 bg-indigo-50\' : \'\'}`}'
new_editor_tab = 'className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors active:bg-gray-100 dark:active:bg-slate-800 ${activeTab === \'editor\' ? \'text-indigo-600 dark:text-indigo-400\' : \'hover:text-gray-700 dark:hover:text-gray-300\'}`}'
content = content.replace(old_editor_tab, new_editor_tab)

old_preview_tab = 'className={`flex-1 flex flex-col items-center justify-center gap-1 ${activeTab === \'preview\' ? \'text-indigo-600 bg-indigo-50\' : \'\'}`}'
new_preview_tab = 'className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors active:bg-gray-100 dark:active:bg-slate-800 ${activeTab === \'preview\' ? \'text-indigo-600 dark:text-indigo-400\' : \'hover:text-gray-700 dark:hover:text-gray-300\'}`}'
content = content.replace(old_preview_tab, new_preview_tab)

with open('src/features/tools/flashcard-maker/FlashcardMaker.tsx', 'w') as f:
    f.write(content)
