import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function Weekly() {
  const { user } = useAuth();
  const [review, setReview] = useState(null);
  
  // States
  const [wentWell, setWentWell] = useState('');
  const [brokeDown, setBrokeDown] = useState('');
  const [nextPlan, setNextPlan] = useState('');
  const [focus, setFocus] = useState({ body: '', mind: '', money: '', create: '', connect: '', future: '' });

  // Get current week's Monday
  const getMonday = (d) => {
    d = new Date(d);
    var day = d.getDay(), diff = d.getDate() - day + (day == 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  };

  const currentMonday = getMonday(new Date());

  useEffect(() => {
    fetchReview();
  }, []);

  const fetchReview = async () => {
    const { data } = await supabase.from('weekly_reviews').select('*').eq('week_start_date', currentMonday).single();
    if (data) {
      setReview(data);
      setWentWell(data.went_well || '');
      setBrokeDown(data.broke_down || '');
      setNextPlan(data.next_plan || '');
      setFocus({
        body: data.focus_body || '', mind: data.focus_mind || '', money: data.focus_money || '',
        create: data.focus_create || '', connect: data.focus_connect || '', future: data.focus_future || ''
      });
    }
  };

  const saveReview = async () => {
    const payload = {
      user_id: user.id,
      week_start_date: currentMonday,
      went_well: wentWell, broke_down: brokeDown, next_plan: nextPlan,
      focus_body: focus.body, focus_mind: focus.mind, focus_money: focus.money,
      focus_create: focus.create, focus_connect: focus.connect, focus_future: focus.future
    };

    if (review) {
      await supabase.from('weekly_reviews').update(payload).eq('id', review.id);
    } else {
      const { data } = await supabase.from('weekly_reviews').insert([payload]).select();
      if (data) setReview(data[0]);
    }
    alert('Weekly rhythm saved.');
  };

  const areas = ['body', 'mind', 'money', 'create', 'connect', 'future'];

  return (
    <div className="space-y-8 pb-12">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="font-heading font-bold text-3xl mb-2">Weekly Rhythm</h1>
          <p className="font-sans text-dark/60">Week of {currentMonday}</p>
        </div>
        <button onClick={saveReview} className="bg-dark text-white px-6 py-2 radius-sys hover:bg-accent transition-colors font-sans text-sm font-medium">
          Save Protocol
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="font-heading font-bold text-xl">The 6 Area Focus</h2>
          {areas.map(area => (
            <div key={area} className="bg-white p-4 radius-sys border border-dark/10 shadow-sm focus-within:border-accent transition-colors">
              <label className="block font-data text-xs text-accent uppercase tracking-wider mb-2">{area}</label>
              <textarea
                value={focus[area]}
                onChange={(e) => setFocus({...focus, [area]: e.target.value})}
                placeholder={`One major focus for ${area} this week...`}
                className="w-full bg-transparent border-none resize-none font-sans text-sm outline-none h-16"
              />
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <h2 className="font-heading font-bold text-xl">Sunday Reflection</h2>
          
          <div className="bg-white p-6 radius-sys border border-dark/10 shadow-sm space-y-6">
            <div>
              <label className="block font-heading font-bold text-dark mb-2">What went well?</label>
              <textarea
                value={wentWell}
                onChange={(e) => setWentWell(e.target.value)}
                className="w-full bg-background border border-dark/20 radius-sys p-4 font-sans text-sm outline-none focus:border-accent h-24 resize-none"
              />
            </div>
            <div>
              <label className="block font-heading font-bold text-dark mb-2">What broke down?</label>
              <textarea
                value={brokeDown}
                onChange={(e) => setBrokeDown(e.target.value)}
                className="w-full bg-background border border-dark/20 radius-sys p-4 font-sans text-sm outline-none focus:border-accent h-24 resize-none"
              />
            </div>
            <div>
              <label className="block font-heading font-bold text-dark mb-2">What is the minimum viable plan for next week?</label>
              <textarea
                value={nextPlan}
                onChange={(e) => setNextPlan(e.target.value)}
                className="w-full bg-background border border-dark/20 radius-sys p-4 font-sans text-sm outline-none focus:border-accent h-24 resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
