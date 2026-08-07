import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { BookOpen, Plus, Sparkles, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import * as aiService from '../services/aiService';

export const Journal = () => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    setLoading(true);
    try {
      const res = await aiService.getJournals();
      if (res.success && res.data) {
        setJournals(res.data);
      }
    } catch (err) {
      toast.error('Failed to load journals');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJournal = async () => {
    if (!newTitle.trim() || !newContent.trim()) return toast.error('Please fill in title and content');

    setSaving(true);
    try {
      const res = await aiService.createJournal({
        title: newTitle,
        content: newContent,
      });

      if (res.success && res.data) {
        setJournals([res.data, ...journals]);
        toast.success('Journal entry saved successfully');
        setIsModalOpen(false);
        setNewTitle('');
        setNewContent('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save journal entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase text-black">Mental Wellness Journal</h1>
            <p className="text-xs font-bold text-neutral-600">Review AI-generated daily logs and personal entries</p>
          </div>
          <Button icon={Plus} onClick={() => setIsModalOpen(true)}>
            New Journal Entry
          </Button>
        </div>

        {/* Journals Grid */}
        {loading ? (
          <p className="text-xs font-bold text-neutral-500 py-12 text-center">Loading journal entries...</p>
        ) : journals.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-neutral-300 rounded-2xl bg-white space-y-3">
            <BookOpen className="w-10 h-10 text-neutral-400 mx-auto" />
            <h3 className="text-base font-black text-black uppercase">No Journal Entries Yet</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Complete a voice check-in to generate an AI journal summary, or create your first personal reflection.
            </p>
            <Button size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
              Write Personal Note
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {journals.map((j) => (
              <Card key={j._id || j.id} className="space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${j.generatedByAI
                        ? 'bg-red-100 text-[#9F1239] border-[#9F1239]'
                        : 'bg-neutral-100 text-neutral-800 border-neutral-300'
                        }`}
                    >
                      {j.generatedByAI ? (
                        <span className="flex items-center">
                          <Sparkles className="w-3 h-3 mr-1" /> AI Generated
                        </span>
                      ) : (
                        'Personal Note'
                      )}
                    </span>
                    <span className="text-[10px] font-semibold text-neutral-500 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {j.createdAt ? format(new Date(j.createdAt), 'MMM dd, yyyy') : 'Recent'}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-black">{j.title}</h3>
                  <p className="text-xs font-medium text-neutral-700 mt-2 leading-relaxed whitespace-pre-line">
                    {j.content}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* New Entry Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Journal Entry">
          <div className="space-y-4">
            <Input
              label="Journal Title"
              placeholder="Evening thoughts..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
                Content
              </label>
              <textarea
                className="w-full bg-white text-black p-3 text-sm rounded-xl polo-border focus:shadow-[4px_4px_0px_0px_#9F1239] focus:outline-none min-h-[120px]"
                placeholder="Write your thoughts..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
              />
            </div>
            <Button className="w-full" loading={saving} onClick={handleCreateJournal}>
              Save Entry
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

