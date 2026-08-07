import React, { useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { BookOpen, Plus, Sparkles, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const Journal = () => {
  const [journals, setJournals] = useState([
    {
      id: 'j-1',
      title: 'AI Journal — Voice Check-in',
      content: 'Work pressures are taking a toll on rest and energy levels. Setting clearer boundary hours will help restore balance.',
      generatedByAI: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'j-2',
      title: 'Evening Reflection',
      content: 'Spent 20 minutes doing outdoor walking today. Felt much lighter after breathing exercises.',
      generatedByAI: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleCreateJournal = () => {
    if (!newTitle.trim() || !newContent.trim()) return toast.error('Please fill in title and content');

    const entry = {
      id: `j-${Date.now()}`,
      title: newTitle,
      content: newContent,
      generatedByAI: false,
      createdAt: new Date().toISOString(),
    };

    setJournals([entry, ...journals]);
    toast.success('Journal entry saved');
    setIsModalOpen(false);
    setNewTitle('');
    setNewContent('');
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {journals.map((j) => (
            <Card key={j.id} className="space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      j.generatedByAI
                        ? 'bg-red-100 text-[#B82126] border-[#B82126]'
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
                    {format(new Date(j.createdAt), 'MMM dd, yyyy')}
                  </span>
                </div>
                <h3 className="text-lg font-black text-black">{j.title}</h3>
                <p className="text-xs font-medium text-neutral-700 mt-2 leading-relaxed">
                  {j.content}
                </p>
              </div>
            </Card>
          ))}
        </div>

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
                className="w-full bg-white text-black p-3 text-sm rounded-xl polo-border focus:shadow-[4px_4px_0px_0px_#B82126] focus:outline-none min-h-[120px]"
                placeholder="Write your thoughts..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleCreateJournal}>
              Save Entry
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};
