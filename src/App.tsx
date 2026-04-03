/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { 
  Plus, 
  MapPin, 
  Clock, 
  Trash2, 
  CalendarDays,
  GripVertical,
  Map as MapIcon,
  Image as ImageIcon,
  X,
  Edit2,
  CheckSquare,
  ShoppingBag,
  Package,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from './lib/utils';
import { Trip, Activity, ChecklistItem } from './types';
import { tripService } from './services/tripService';

export default function App() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activeChecklist, setActiveChecklist] = useState<'preparation' | 'shoppingList' | null>(null);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    time: '',
    title: '',
    location: '',
    notes: '',
    naverMapUrl: '',
    imageUrl: ''
  });

  useEffect(() => {
    const loadedTrips = tripService.getTrips();
    const defaultTripId = 'default-trip-busan-2026';
    const existingDefault = loadedTrips.find(t => t.id === defaultTripId);

    if (existingDefault) {
      if (existingDefault.name !== 'Busan Trip！🇰🇷') {
        existingDefault.name = 'Busan Trip！🇰🇷';
        tripService.updateTrip(existingDefault);
      }
      setTrips(loadedTrips);
      setActiveTrip(existingDefault);
    } else {
      const defaultDates = ['2026-04-23', '2026-04-24', '2026-04-25', '2026-04-26', '2026-04-27'];
      const defaultTrip: Trip = {
        id: defaultTripId,
        name: 'Busan Trip！🇰🇷',
        startDate: '2026-04-23',
        endDate: '2026-04-27',
        itinerary: defaultDates.map(date => ({
          id: crypto.randomUUID(),
          date,
          activities: []
        })),
        expenses: [],
        transportation: [],
        preparation: [],
        shoppingList: []
      };
      const newTrips = [defaultTrip, ...loadedTrips.filter(t => t.id !== defaultTripId)];
      setTrips(newTrips);
      setActiveTrip(defaultTrip);
      tripService.saveTrips(newTrips);
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewActivity(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveActivity = () => {
    if (!activeTrip || !newActivity.title) return;
    
    const newItinerary = [...activeTrip.itinerary];
    
    if (editingActivityId) {
      // Update existing
      newItinerary[selectedDayIdx].activities = newItinerary[selectedDayIdx].activities.map(a => 
        a.id === editingActivityId 
          ? { ...a, ...newActivity as Activity } 
          : a
      );
    } else {
      // Add new
      const activity: Activity = {
        id: crypto.randomUUID(),
        title: newActivity.title || '',
        time: newActivity.time || '',
        location: newActivity.location || '',
        notes: newActivity.notes || '',
        naverMapUrl: newActivity.naverMapUrl || '',
        imageUrl: newActivity.imageUrl || ''
      };
      newItinerary[selectedDayIdx].activities.push(activity);
    }

    updateActiveTrip({ ...activeTrip, itinerary: newItinerary });
    closeModal();
  };

  const openEditModal = (activity: Activity) => {
    setEditingActivityId(activity.id);
    setNewActivity({ ...activity });
    setIsAddingActivity(true);
  };

  const closeModal = () => {
    setIsAddingActivity(false);
    setEditingActivityId(null);
    setNewActivity({ time: '', title: '', location: '', notes: '', naverMapUrl: '', imageUrl: '' });
  };

  const updateActiveTrip = (updated: Trip) => {
    setActiveTrip(updated);
    tripService.updateTrip(updated);
    setTrips(trips.map(t => t.id === updated.id ? updated : t));
  };

  const handleAddChecklistItem = () => {
    if (!activeTrip || !activeChecklist || !newChecklistItem.trim()) return;
    
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text: newChecklistItem.trim(),
      completed: false
    };

    const updatedTrip = { ...activeTrip };
    if (activeChecklist === 'preparation') {
      updatedTrip.preparation = [...(updatedTrip.preparation || []), newItem];
    } else {
      updatedTrip.shoppingList = [...(updatedTrip.shoppingList || []), newItem];
    }

    updateActiveTrip(updatedTrip);
    setNewChecklistItem('');
  };

  const toggleChecklistItem = (id: string) => {
    if (!activeTrip || !activeChecklist) return;

    const updatedTrip = { ...activeTrip };
    if (activeChecklist === 'preparation') {
      updatedTrip.preparation = updatedTrip.preparation?.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      );
    } else {
      updatedTrip.shoppingList = updatedTrip.shoppingList?.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      );
    }

    updateActiveTrip(updatedTrip);
  };

  const deleteChecklistItem = (id: string) => {
    if (!activeTrip || !activeChecklist) return;

    const updatedTrip = { ...activeTrip };
    if (activeChecklist === 'preparation') {
      updatedTrip.preparation = updatedTrip.preparation?.filter(item => item.id !== id);
    } else {
      updatedTrip.shoppingList = updatedTrip.shoppingList?.filter(item => item.id !== id);
    }

    updateActiveTrip(updatedTrip);
  };

  if (!activeTrip) return null;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-transparent">
      {/* Header */}
      <header 
        className="px-6 py-4 sticky top-0 z-20 border-dashed border-[6px] border-header-border"
        style={{ backgroundColor: '#7aced7', color: '#375d50' }}
      >
        <div className="max-w-2xl mx-auto">
          <h1 
            className="text-lg font-bold text-center tracking-tight"
            style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#ffffff' }}
          >
            {activeTrip.name}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main 
        className="flex-1 max-w-2xl w-full mx-auto p-4 md:p-8 shadow-2xl my-4 rounded-[40px] border border-white/40"
        style={{
          backgroundImage: "url('https://storage.googleapis.com/m-infra-prod-ais-pre-assets/u7m33byq44epywe2ihgjwd/371098637623/9103e3a9-e374-4536-a365-546051786586.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'local',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'white'
        }}
      >
        <div className="space-y-6">
          {/* Quick Access Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-2">
            <button 
              onClick={() => setActiveChecklist('preparation')}
              className="flex items-center justify-center gap-2 py-3 bg-prep-bg rounded-2xl border border-white/20 text-checklist-text font-bold text-sm shadow-md hover:opacity-90 transition-all"
            >
              <Package size={18} className="text-checklist-text" />
              行前準備
            </button>
            <button 
              onClick={() => setActiveChecklist('shoppingList')}
              className="flex items-center justify-center gap-2 py-3 bg-shop-bg rounded-2xl border border-white/20 text-checklist-text font-bold text-sm shadow-md hover:opacity-90 transition-all"
            >
              <ShoppingBag size={18} className="text-checklist-text" />
              購物清單
            </button>
          </div>

          {/* Day Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar border-b border-coffee/5 mb-4">
            {activeTrip.itinerary.map((day, idx) => (
              <button
                key={day.id}
                onClick={() => setSelectedDayIdx(idx)}
                className={cn(
                  "shrink-0 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border flex flex-col items-center gap-0.5",
                  selectedDayIdx === idx 
                    ? "bg-chew-coral text-white border-chew-coral shadow-md" 
                    : "bg-white text-grey-text border-chew-pink/50 hover:border-chew-coral"
                )}
              >
                <span className="text-[11px]">{format(parseISO(day.date), 'MM-dd')}</span>
                <span className="text-[9px] opacity-80">（{['日', '一', '二', '三', '四', '五', '六'][parseISO(day.date).getDay()]}）</span>
              </button>
            ))}
          </div>

          {/* Selected Day Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTrip.itinerary[selectedDayIdx]?.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <Reorder.Group 
                axis="y" 
                values={activeTrip.itinerary[selectedDayIdx]?.activities || []} 
                onReorder={(newActivities) => {
                  const newItinerary = [...activeTrip.itinerary];
                  newItinerary[selectedDayIdx].activities = newActivities;
                  updateActiveTrip({ ...activeTrip, itinerary: newItinerary });
                }}
                className="space-y-4 pb-24"
              >
                {activeTrip.itinerary[selectedDayIdx]?.activities.map((activity) => (
                  <Reorder.Item 
                    key={activity.id} 
                    value={activity}
                    onClick={() => setSelectedActivity(activity)}
                    className="group bg-white rounded-3xl overflow-hidden flex flex-col cursor-pointer hover:shadow-xl transition-all border border-chew-pink/30"
                  >
                    <div className="p-4 flex items-start gap-4">
                      {/* Left Side: Time */}
                      <div className="flex flex-col items-center justify-center pt-1 min-w-[70px] gap-1 text-center">
                        <div className="text-[10px] font-bold text-coffee/40 uppercase tracking-widest">
                          TIME
                        </div>
                        <div className="text-2xl font-bold text-coffee tracking-tighter leading-none">
                          {activity.time || '--:--'}
                        </div>
                      </div>

                      {/* Right Side: Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-base text-coffee leading-tight">{activity.title}</h4>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {activity.naverMapUrl && (
                            <a 
                              href={activity.naverMapUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-naver-text text-[9px] font-bold transition-all shadow-sm border border-black/5"
                              style={{ backgroundColor: '#d8f8a0', borderRadius: '100px' }}
                            >
                              <MapIcon size={10} />
                              Naver Map
                            </a>
                          )}
                          <div className="flex items-center gap-1 ml-auto">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(activity);
                              }}
                              className="p-1.5 transition-colors"
                              style={{ color: '#c85050' }}
                            >
                              <Edit2 size={16} style={{ borderColor: '#ae3c3c' }} />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('刪除此活動？')) {
                                  const newItinerary = [...activeTrip.itinerary];
                                  newItinerary[selectedDayIdx].activities = newItinerary[selectedDayIdx].activities.filter(a => a.id !== activity.id);
                                  updateActiveTrip({ ...activeTrip, itinerary: newItinerary });
                                }
                              }}
                              className="p-1.5 transition-colors"
                              style={{ color: '#606060' }}
                            >
                              <Trash2 size={16} style={{ fontWeight: 'bold' }} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div onClick={(e) => e.stopPropagation()} className="cursor-grab active:cursor-grabbing h-full flex items-center">
                        <GripVertical size={18} style={{ color: '#6d6d6d', borderColor: '#707070' }} />
                      </div>
                    </div>
                  </Reorder.Item>
                ))}
                {activeTrip.itinerary[selectedDayIdx]?.activities.length === 0 && (
                  <div className="py-16 text-center">
                    <div className="w-12 h-12 bg-chew-pink/40 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CalendarDays className="text-grey-text/30" size={24} />
                    </div>
                    <p className="text-xs text-grey-text font-medium">今天還沒有安排行程</p>
                  </div>
                )}
              </Reorder.Group>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Fixed Add Button */}
      <div className="fixed bottom-8 right-8 z-30">
        <button 
          onClick={() => setIsAddingActivity(true)}
          className="w-14 h-14 bg-chew-blue text-coffee rounded-full flex items-center justify-center hover:bg-chew-blue/80 transition-all shadow-2xl active:scale-95"
        >
          <Plus size={28} />
        </button>
      </div>

      {/* Add/Edit Activity Modal */}
      <AnimatePresence>
        {isAddingActivity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-coffee/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-chew-pink/50"
            >
              <div className="p-4 border-b border-chew-pink/50 flex items-center justify-between bg-chew-yellow/20">
                <h3 className="text-base font-display font-bold text-coffee">
                  {editingActivityId ? '編輯行程' : '新增行程'}
                </h3>
                <button onClick={closeModal} className="text-grey-text hover:text-coffee">
                  <X size={18} />
                </button>
              </div>
              <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar">
                <div>
                  <label className="block text-[11px] font-bold text-coffee/70 mb-1">行程</label>
                  <input 
                    type="text"
                    value={newActivity.title}
                    onChange={e => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="例如：海雲台沙灘"
                    className="w-full px-4 py-2.5 rounded-xl border border-chew-pink/30 focus:outline-none focus:ring-2 focus:ring-chew-yellow/50 focus:border-chew-yellow transition-all text-sm text-coffee"
                  />
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-coffee/70 mb-1">時間</label>
                    <input 
                      type="text"
                      value={newActivity.time}
                      onChange={e => setNewActivity(prev => ({ ...prev, time: e.target.value }))}
                      placeholder="例如：10:00"
                      className="w-full px-4 py-2.5 rounded-xl border border-chew-pink/30 focus:outline-none focus:ring-2 focus:ring-chew-yellow/50 focus:border-chew-yellow transition-all text-sm text-coffee"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-coffee/70 mb-1">地址</label>
                    <textarea 
                      value={newActivity.location}
                      onChange={e => setNewActivity(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="例如：釜山廣域市..."
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-xl border border-chew-pink/30 focus:outline-none focus:ring-2 focus:ring-chew-yellow/50 focus:border-chew-yellow transition-all text-sm text-coffee resize-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-coffee/70 mb-1">Naver Map 連結</label>
                  <input 
                    type="text"
                    value={newActivity.naverMapUrl}
                    onChange={e => setNewActivity(prev => ({ ...prev, naverMapUrl: e.target.value }))}
                    placeholder="貼上 Naver Map 連結"
                    className="w-full px-4 py-2.5 rounded-xl border border-chew-pink/30 focus:outline-none focus:ring-2 focus:ring-chew-yellow/50 focus:border-chew-yellow transition-all text-sm text-coffee"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-coffee/70 mb-1">備註</label>
                  <textarea 
                    value={newActivity.notes}
                    onChange={e => setNewActivity(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="輸入備註..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-chew-pink/30 focus:outline-none focus:ring-2 focus:ring-chew-yellow/50 focus:border-chew-yellow transition-all text-sm text-coffee resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-coffee/70 mb-1">照片</label>
                  <div className="relative group">
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label 
                      htmlFor="image-upload"
                      className="w-full h-24 rounded-xl border-2 border-dashed border-chew-pink/30 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-chew-yellow hover:bg-chew-yellow/5 transition-all overflow-hidden"
                    >
                      {newActivity.imageUrl ? (
                        <img src={newActivity.imageUrl} className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <ImageIcon className="text-grey-text/30" size={24} />
                          <span className="text-[10px] font-bold text-grey-text/50">點擊上傳照片</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
              <div className="p-5 border-t border-chew-pink/50 bg-chew-blue/5">
                <button 
                  onClick={handleSaveActivity}
                  disabled={!newActivity.title}
                  className="w-full py-3.5 bg-chew-coral text-white rounded-xl font-bold shadow-lg shadow-chew-coral/20 hover:bg-chew-coral/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingActivityId ? '儲存修改' : '新增行程'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail View Modal */}
      <AnimatePresence>
        {selectedActivity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedActivity(null)}
              className="absolute inset-0 bg-coffee/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-chew-pink/50"
            >
              <div className="p-5 border-b border-chew-pink/50 flex items-center justify-between bg-chew-blue/20">
                <h3 className="text-lg font-display font-bold text-coffee">行程詳情</h3>
                <button onClick={() => setSelectedActivity(null)} className="text-grey-text hover:text-coffee">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center px-3 py-2 bg-chew-pink/30 rounded-xl">
                    <Clock size={14} className="text-coffee/60 mb-1" />
                    <span className="text-xs font-bold text-coffee">{selectedActivity.time || '--:--'}</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-[15px] font-bold text-coffee">{selectedActivity.title}</h2>
                    {selectedActivity.location && (
                      <p className="text-xs text-grey-text flex items-center gap-1 mt-1">
                        <MapPin size={12} /> {selectedActivity.location}
                      </p>
                    )}
                  </div>
                </div>

                {selectedActivity.notes && (
                  <div className="bg-chew-yellow/10 p-4 rounded-2xl border border-chew-yellow/20">
                    <h4 className="text-[10px] font-bold text-coffee/40 uppercase tracking-widest mb-2">備註</h4>
                    <p className="text-sm text-coffee whitespace-pre-wrap">{selectedActivity.notes}</p>
                  </div>
                )}

                {selectedActivity.imageUrl && (
                  <div className="rounded-2xl overflow-hidden shadow-sm border border-chew-pink/30">
                    <img 
                      src={selectedActivity.imageUrl} 
                      alt={selectedActivity.title} 
                      className="w-full h-auto object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {selectedActivity.naverMapUrl && (
                  <a 
                    href={selectedActivity.naverMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-naver-bg text-naver-text font-bold rounded-xl hover:opacity-90 transition-all"
                    style={{ lineHeight: '18px', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}
                  >
                    <MapIcon size={18} />
                    在 Naver Map 中查看
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Checklist Modal */}
      <AnimatePresence>
        {activeChecklist && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveChecklist(null)}
              className="absolute inset-0 bg-coffee/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-chew-pink/50"
            >
              <div className={cn(
                "p-5 border-b border-white/10 flex items-center justify-between",
                activeChecklist === 'preparation' ? "bg-prep-bg" : "bg-shop-bg"
              )}>
                <h3 className="text-lg font-display font-bold text-checklist-text flex items-center gap-2">
                  {activeChecklist === 'preparation' ? <Package size={20} /> : <ShoppingBag size={20} />}
                  {activeChecklist === 'preparation' ? '行前準備' : '購物清單'}
                </h3>
                <button onClick={() => setActiveChecklist(null)} className="text-checklist-text/80 hover:text-checklist-text">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-5">
                <div className="flex gap-2 mb-6">
                  <input 
                    type="text"
                    value={newChecklistItem}
                    onChange={e => setNewChecklistItem(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddChecklistItem()}
                    placeholder="新增項目..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-chew-pink/30 focus:outline-none focus:ring-2 focus:ring-chew-coral/50 focus:border-chew-coral transition-all text-sm text-coffee"
                  />
                  <button 
                    onClick={handleAddChecklistItem}
                    className="px-4 bg-chew-coral text-white rounded-xl font-bold shadow-md hover:bg-chew-coral/80 transition-all"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 no-scrollbar">
                  {(activeChecklist === 'preparation' ? activeTrip.preparation : activeTrip.shoppingList)?.map(item => (
                    <div 
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-chew-pink/5 rounded-xl border border-chew-pink/10 group"
                    >
                      <button 
                        onClick={() => toggleChecklistItem(item.id)}
                        className={cn(
                          "shrink-0 transition-colors",
                          item.completed ? "text-chew-coral" : "text-grey-text/30"
                        )}
                      >
                        {item.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                      </button>
                      <span className={cn(
                        "flex-1 text-sm font-medium transition-all",
                        item.completed ? "text-grey-text line-through opacity-50" : "text-coffee"
                      )}>
                        {item.text}
                      </span>
                      <button 
                        onClick={() => deleteChecklistItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-grey-text/30 hover:text-chew-coral transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {((activeChecklist === 'preparation' ? activeTrip.preparation : activeTrip.shoppingList)?.length || 0) === 0 && (
                    <div className="text-center py-12">
                      <CheckSquare size={32} className="mx-auto text-grey-text/20 mb-2" />
                      <p className="text-xs text-grey-text">清單還是空的，快來新增吧！</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
