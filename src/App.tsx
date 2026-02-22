/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Users, 
  Trophy, 
  Trash2, 
  Plus, 
  FileText, 
  Settings2, 
  RotateCcw,
  LayoutGrid,
  CheckCircle2,
  AlertCircle,
  Download,
  Copy,
  UserPlus,
  Info,
  DownloadCloud
} from 'lucide-react';
import Papa from 'papaparse';
import confetti from 'canvas-confetti';
import { cn } from './lib/utils';
import { Person, TabType } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('input');
  const [names, setNames] = useState<Person[]>([]);
  const [inputText, setInputText] = useState('');
  const [winners, setWinners] = useState<Person[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState<string | null>(null);
  const [drawSettings, setDrawSettings] = useState({
    allowRepeat: false,
    drawCount: 1
  });
  const [groupSettings, setGroupSettings] = useState({
    size: 4
  });
  const [groups, setGroups] = useState<Person[][]>([]);

  const duplicates = names.filter((person, index) => 
    names.findIndex(n => n.name === person.name) !== index
  ).map(p => p.name);

  const hasDuplicates = duplicates.length > 0;

  const loadMockData = () => {
    const mockNames = [
      '陳大文', '李小美', '張三', '李四', '王五', 
      '趙六', '孫七', '周八', '吳九', '鄭十',
      '林志玲', '周杰倫', '蔡依林', '劉德華', '張學友',
      '郭富城', '黎明', '金城武', '梁朝偉', '張曼玉'
    ].map(n => ({ id: Math.random().toString(36).substr(2, 9), name: n }));
    setNames(mockNames);
  };

  const removeDuplicates = () => {
    const seen = new Set();
    const uniqueNames = names.filter(person => {
      const duplicate = seen.has(person.name);
      seen.add(person.name);
      return !duplicate;
    });
    setNames(uniqueNames);
  };

  const downloadGroupsCSV = () => {
    if (groups.length === 0) return;
    
    const csvData = groups.flatMap((group, idx) => 
      group.map(person => ({
        '組別': `第 ${idx + 1} 組`,
        '姓名': person.name
      }))
    );

    const csv = Papa.unparse(csvData);
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `分組結果_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle CSV Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const parsedNames = results.data
          .flat()
          .map(n => String(n).trim())
          .filter(n => n.length > 0)
          .map(n => ({ id: Math.random().toString(36).substr(2, 9), name: n }));
        
        setNames(prev => [...prev, ...parsedNames]);
      },
      header: false
    });
  };

  // Handle Manual Input
  const handleAddNames = () => {
    const newNames = inputText
      .split(/[\n,]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0)
      .map(n => ({ id: Math.random().toString(36).substr(2, 9), name: n }));
    
    setNames(prev => [...prev, ...newNames]);
    setInputText('');
  };

  const removeName = (id: string) => {
    setNames(names.filter(n => n.id !== id));
  };

  const clearAll = () => {
    if (confirm('確定要清除所有名單嗎？')) {
      setNames([]);
      setWinners([]);
      setGroups([]);
    }
  };

  // Lucky Draw Logic
  const startDraw = async () => {
    if (names.length === 0) return;
    
    const availableNames = drawSettings.allowRepeat 
      ? names 
      : names.filter(n => !winners.find(w => w.id === n.id));

    if (availableNames.length === 0) {
      alert('沒有可抽取的名單了！');
      return;
    }

    setIsDrawing(true);
    
    // Animation effect
    let counter = 0;
    const duration = 2000;
    const interval = 50;
    const steps = duration / interval;

    const timer = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * availableNames.length);
      setCurrentCandidate(availableNames[randomIndex].name);
      counter++;

      if (counter >= steps) {
        clearInterval(timer);
        const finalWinner = availableNames[Math.floor(Math.random() * availableNames.length)];
        setWinners(prev => [finalWinner, ...prev]);
        setCurrentCandidate(finalWinner.name);
        setIsDrawing(false);
        
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b']
        });
      }
    }, interval);
  };

  // Grouping Logic
  const generateGroups = () => {
    if (names.length === 0) return;
    
    const shuffled = [...names].sort(() => Math.random() - 0.5);
    const result: Person[][] = [];
    const size = groupSettings.size;

    for (let i = 0; i < shuffled.length; i += size) {
      result.push(shuffled.slice(i, i + size));
    }
    
    setGroups(result);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Users className="text-white w-5 h-5" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-900">HR Pro Tool</h1>
          </div>
          
          <nav className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {(['input', 'draw', 'group'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {tab === 'input' && '名單匯入'}
                {tab === 'draw' && '獎品抽籤'}
                {tab === 'group' && '自動分組'}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* TAB: INPUT */}
          {activeTab === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <div className="md:col-span-2 space-y-6">
                <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-500" />
                    新增名單
                  </h2>
                  <div className="space-y-4">
                    <div className="relative">
                      <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="在此貼上姓名（每行一個或用逗號分隔）..."
                        className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none outline-none"
                      />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleAddNames}
                        disabled={!inputText.trim()}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> 加入名單
                      </button>
                      <label className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer">
                        <Upload className="w-4 h-4" /> 上傳 CSV
                        <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                      </label>
                      <button
                        onClick={loadMockData}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <Copy className="w-4 h-4" /> 載入模擬名單
                      </button>
                    </div>
                  </div>
                </section>

                <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-500" />
                      目前名單 ({names.length})
                    </h2>
                    <div className="flex items-center gap-3">
                      {hasDuplicates && (
                        <button 
                          onClick={removeDuplicates}
                          className="text-xs bg-amber-50 text-amber-600 hover:bg-amber-100 px-2 py-1 rounded-lg flex items-center gap-1 font-medium border border-amber-100"
                        >
                          <Trash2 className="w-3 h-3" /> 移除重複 ({duplicates.length})
                        </button>
                      )}
                      {names.length > 0 && (
                        <button 
                          onClick={clearAll}
                          className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1 font-medium"
                        >
                          <Trash2 className="w-4 h-4" /> 全部清除
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {names.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>尚未匯入任何名單</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[400px] overflow-y-auto pr-2">
                      {names.map((person) => {
                        const isDuplicate = names.filter(n => n.name === person.name).length > 1;
                        return (
                          <div 
                            key={person.id}
                            className={cn(
                              "group flex items-center justify-between px-3 py-2 rounded-lg border transition-all",
                              isDuplicate 
                                ? "bg-amber-50 border-amber-200 text-amber-900" 
                                : "bg-slate-50 border-slate-100 hover:border-indigo-200"
                            )}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="text-sm font-medium truncate">{person.name}</span>
                              {isDuplicate && <AlertCircle className="w-3 h-3 text-amber-500 flex-shrink-0" title="重複姓名" />}
                            </div>
                            <button 
                              onClick={() => removeName(person.id)}
                              className={cn(
                                "opacity-0 group-hover:opacity-100 p-1 transition-all",
                                isDuplicate ? "text-amber-400 hover:text-red-500" : "text-slate-400 hover:text-red-500"
                              )}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>

              <div className="space-y-6">
                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                  <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> 使用說明
                  </h3>
                  <ul className="text-sm text-indigo-700 space-y-2 list-disc list-inside">
                    <li>您可以直接貼上姓名列表</li>
                    <li>支援 CSV 檔案匯入</li>
                    <li>匯入後可隨時刪除個別成員</li>
                    <li>切換標籤即可開始抽籤或分組</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: DRAW */}
          {activeTab === 'draw' && (
            <motion.div
              key="draw"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                
                <div className="mb-8">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-amber-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">幸運大抽籤</h2>
                  <p className="text-slate-500 mt-1">目前名單總數：{names.length} 人</p>
                </div>

                <div className="h-48 flex items-center justify-center mb-8 bg-slate-50 rounded-2xl border border-slate-100">
                  <AnimatePresence mode="wait">
                    {currentCandidate ? (
                      <motion.div
                        key={currentCandidate}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={cn(
                          "text-5xl font-black tracking-wider",
                          isDrawing ? "text-slate-400 blur-[1px]" : "text-indigo-600"
                        )}
                      >
                        {currentCandidate}
                      </motion.div>
                    ) : (
                      <div className="text-slate-300 text-lg font-medium italic">
                        準備好抽獎了嗎？
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                  <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-xl">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={drawSettings.allowRepeat}
                        onChange={(e) => setDrawSettings(prev => ({ ...prev, allowRepeat: e.target.checked }))}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-slate-700">允許重複中獎</span>
                    </label>
                  </div>
                  
                  <button
                    onClick={startDraw}
                    disabled={isDrawing || names.length === 0}
                    className="w-full sm:w-48 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all transform active:scale-95 flex items-center justify-center gap-2 text-lg"
                  >
                    {isDrawing ? (
                      <>
                        <RotateCcw className="w-5 h-5 animate-spin" />
                        抽籤中...
                      </>
                    ) : (
                      <>
                        <Trophy className="w-5 h-5" />
                        開始抽籤
                      </>
                    )}
                  </button>
                </div>

                {winners.length > 0 && (
                  <div className="border-t border-slate-100 pt-8 text-left">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        中獎名單 ({winners.length})
                      </h3>
                      <button 
                        onClick={() => setWinners([])}
                        className="text-xs font-medium text-slate-400 hover:text-slate-600"
                      >
                        重置名單
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {winners.map((winner, idx) => (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          key={`${winner.id}-${idx}`}
                          className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-4 py-2 rounded-xl font-bold flex items-center gap-2"
                        >
                          <span className="text-xs opacity-50">#{winners.length - idx}</span>
                          {winner.name}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB: GROUP */}
          {activeTab === 'group' && (
            <motion.div
              key="group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <LayoutGrid className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">自動分組</h2>
                    <p className="text-sm text-slate-500">快速將名單隨機分配到不同小組</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
                    <span className="text-sm font-medium text-slate-600 whitespace-nowrap">每組人數</span>
                    <input 
                      type="number" 
                      min="1"
                      max={names.length}
                      value={groupSettings.size}
                      onChange={(e) => setGroupSettings({ size: parseInt(e.target.value) || 1 })}
                      className="w-16 bg-transparent font-bold text-indigo-600 outline-none"
                    />
                  </div>
                  <button
                    onClick={generateGroups}
                    disabled={names.length === 0}
                    className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold px-8 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100"
                  >
                    隨機分組
                  </button>
                  {groups.length > 0 && (
                    <button
                      onClick={downloadGroupsCSV}
                      className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-2"
                    >
                      <DownloadCloud className="w-4 h-4" /> 下載 CSV
                    </button>
                  )}
                </div>
              </div>

              {groups.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groups.map((group, idx) => (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      key={idx}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                    >
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                        <span className="font-bold text-slate-700">第 {idx + 1} 組</span>
                        <span className="text-xs font-medium text-slate-400">{group.length} 人</span>
                      </div>
                      <div className="p-4 space-y-2">
                        {group.map((person) => (
                          <div key={person.id} className="flex items-center gap-2 text-slate-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            <span className="text-sm font-medium">{person.name}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                  <LayoutGrid className="w-16 h-16 mx-auto mb-4 opacity-10" />
                  <p className="text-lg font-medium">設定人數並點擊按鈕開始分組</p>
                  <p className="text-sm opacity-60">目前共有 {names.length} 位成員可供分配</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 py-12 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} HR Pro Tool - 專業抽籤與分組工具</p>
      </footer>
    </div>
  );
}
