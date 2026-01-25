'use client';

import { useDeckStore } from '@/store/deck-store';
import { Plus, DownloadCloud } from 'lucide-react';
import { Editor } from '@/components/Editor';
import { SortableSlideList } from '@/components/SortableSlideList';
import { ThemeSelector } from '@/components/ThemeSelector';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generateImage } from '@/utils/generateImage';
import { useState } from 'react';

export default function Home() {
  const { slides, addSlide, globalTheme } = useDeckStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportAll = async () => {
      if (slides.length === 0) return;
      setIsExporting(true);
      try {
          const zip = new JSZip();
          const imgFolder = zip.folder("images");
  
          await Promise.all(slides.map(async (slide, i) => {
               const blob = await generateImage(slide, globalTheme);
               imgFolder?.file(`slide-${i + 1}.png`, blob);
          }));
  
          const content = await zip.generateAsync({ type: 'blob' });
          saveAs(content, 'subbox-deck.zip');
      } catch (e) {
          console.error(e);
          alert('Failed to export deck');
      } finally {
          setIsExporting(false);
      }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar Controls */}
      <aside className="w-64 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-black">
        <div className="p-4">
             <h1 className="text-xl font-bold">Subbox</h1>
        </div>
        
        <ThemeSelector />

        <div className="p-4 flex flex-col gap-4 flex-1 overflow-hidden">
            <button
                onClick={addSlide}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors justify-center cursor-pointer"
            >
                <Plus size={16} /> Add Slide
            </button>
            
             <button
                onClick={handleExportAll}
                disabled={isExporting || slides.length === 0}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors justify-center cursor-pointer disabled:opacity-50"
            >
                <DownloadCloud size={16} /> {isExporting ? 'Exporting...' : 'Export All'}
            </button>

            <div className="flex-1 overflow-y-auto">
                <SortableSlideList />
            </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Editor />
      </main>
    </div>
  );
}