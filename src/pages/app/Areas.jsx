import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function Areas() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);

  const areaDefs = [
    { name: 'Body', full: 'Strength training 4x/week, zone 2 cardio 2x/week, strict macro tracking.', min: '15 min walk, drink 2L water.' },
    { name: 'Mind', full: 'Read 30 mins, 20 min meditation, zero phone in bed.', min: 'Read 1 page, 5 min box breathing.' },
    { name: 'Money', full: 'Track all expenses, review portfolio, execute planned trades.', min: 'Don\'t buy anything impulsive.' },
    { name: 'Create', full: 'Write 1000 words or code 2 hours deep work.', min: 'Open the project, write 1 sentence/line of code.' },
    { name: 'Connect', full: 'Call family, schedule dinner with friend, be fully present.', min: 'Send 1 thoughtful text.' },
    { name: 'Future', full: 'Review 5-year plan, study new high-leverage skill.', min: 'Write down 1 thing I\'m looking forward to.' }
  ];

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    const { data } = await supabase.from('goals').select('*').eq('is_completed', false);
    if (data) setGoals(data);
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-heading font-bold text-3xl mb-2">The 6 Domains</h1>
        <p className="font-sans text-dark/60">
          Your permanent identity architecture. Full standards vs Lite Mode minimums.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {areaDefs.map(area => {
          const areaGoals = goals.filter(g => g.area === area.name);
          return (
            <div key={area.name} className="bg-white p-6 radius-sys border border-dark/10 shadow-sm flex flex-col">
              <h2 className="font-heading font-bold text-xl uppercase tracking-wider text-accent mb-4">{area.name}</h2>
              
              <div className="space-y-4 mb-6 flex-1">
                <div>
                  <div className="font-data text-xs text-dark/40 uppercase mb-1">Full Standard</div>
                  <div className="font-sans text-sm text-dark">{area.full}</div>
                </div>
                <div>
                  <div className="font-data text-xs text-dark/40 uppercase mb-1">Lite Minimum</div>
                  <div className="font-sans text-sm text-dark/60">{area.min}</div>
                </div>
              </div>

              {areaGoals.length > 0 && (
                <div className="pt-4 border-t border-dark/10">
                  <div className="font-data text-xs text-dark/40 uppercase mb-2">Active Goals</div>
                  <ul className="space-y-1">
                    {areaGoals.map(g => (
                      <li key={g.id} className="font-sans text-sm text-dark flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                        <span>{g.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
