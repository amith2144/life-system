import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function Capture() {
  const { user } = useAuth();
  const [captures, setCaptures] = useState([]);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Note');

  const categories = ['Idea', 'Learn', 'Plan', 'Worry', 'Note'];

  useEffect(() => {
    fetchCaptures();
  }, []);

  const fetchCaptures = async () => {
    const { data } = await supabase.from('captures').select('*').order('created_at', { ascending: false });
    if (data) setCaptures(data);
  };

  const addCapture = async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!content.trim()) return;
      
      const { data } = await supabase.from('captures').insert([{ 
        user_id: user.id,
        content,
        category
      }]).select();
      
      if (data) {
        setCaptures([data[0], ...captures]);
        setContent('');
      }
    }
  };

  const deleteCapture = async (id) => {
    await supabase.from('captures').delete().eq('id', id);
    setCaptures(captures.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <header className="text-center mb-12">
        <h1 className="font-heading font-bold text-3xl mb-2">Brain Dump</h1>
        <p className="font-sans text-dark/60">Get it out of your head. Sort it later.</p>
      </header>

      <div className="bg-white p-2 radius-sys-lg border border-dark/10 shadow-lg flex items-start space-x-2 relative focus-within:border-accent transition-colors">
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          className="bg-dark text-white radius-sys px-4 py-3 font-data text-xs uppercase tracking-wider outline-none cursor-pointer"
        >
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={addCapture}
          placeholder="Type and press Enter to capture..."
          className="flex-1 bg-transparent border-none resize-none px-4 py-3 font-sans text-lg outline-none h-12 min-h-[3rem]"
          rows="1"
        />
      </div>

      <div className="space-y-4 pt-8">
        {captures.map(c => (
          <div key={c.id} className="group flex justify-between items-start bg-background p-4 radius-sys border border-dark/5 hover:border-dark/20 transition-colors">
            <div className="flex space-x-4">
              <span className="bg-dark/5 text-dark font-data text-xs px-2 py-1 rounded uppercase tracking-wider h-fit">
                {c.category}
              </span>
              <p className="font-sans text-dark whitespace-pre-wrap">{c.content}</p>
            </div>
            <button 
              onClick={() => deleteCapture(c.id)}
              className="text-dark/20 hover:text-accent opacity-0 group-hover:opacity-100 transition-all"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
