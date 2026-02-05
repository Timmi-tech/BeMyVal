import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/db';
import { Heart, Copy, ExternalLink, RefreshCw } from 'lucide-react';

const TrackerPage = () => {
  const { id } = useParams();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState(Notification.permission);
  
  // Use ref to track previous status for notifications
  const prevStatus = useRef<string | null>(null);

  const valentineLink = `${window.location.origin}/u/${id}`;

  const fetchStatus = async () => {
    try {
      const result = await db.query('SELECT status FROM cards WHERE id = $1', [id]);
      if (result.rows.length > 0) {
        const newStatus = result.rows[0].status;
        
        // Notify if status changed from waiting to something else
        // strict check ensures we don't notify on first load if already answered
        if (prevStatus.current === 'waiting' && newStatus !== 'waiting') {
             if (Notification.permission === 'granted') {
                new Notification('Valentine Update! 💌', {
                    body: `They replied: ${newStatus === 'yes' ? 'YES! ❤️' : 'No 💔'}`,
                    icon: '/favicon.ico'
                });
            }
            
            // Play Sound logic
            try {
                const audio = new Audio('/Easy (Jeje).mp3');
                audio.volume = 1.0; 
                await audio.play();
            } catch (e) {
                console.log('Audio error (interaction needed):', e);
            }
        }
        
        setStatus(newStatus);
        prevStatus.current = newStatus;
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
       setLoading(false);
    }
  };

  const requestPermission = () => {
    Notification.requestPermission().then(p => {
        setPermission(p);
        if (p === 'granted') {
            new Notification('Notifications enabled! ✅', { body: 'We will tell you when they reply!' });
        }
    });
  };

  useEffect(() => {
    fetchStatus(); // Initial fetch
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const copyLink = () => {
    navigator.clipboard.writeText(valentineLink);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6 text-white text-center">
           <h2 className="text-2xl font-bold">Valentine Tracker</h2>
           <p className="opacity-90 text-sm mt-1 mb-2">Secret Key: {id}</p>
           {permission === 'default' && (
             <button 
                onClick={requestPermission}
                className="text-xs bg-white text-pink-600 px-3 py-1 rounded-full font-bold shadow-sm hover:scale-105 transition-transform"
             >
                Enable Notifications 🔔
             </button>
           )}
        </div>

        <div className="p-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Your Valentine Link
                </label>
                <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                        <input 
                            readOnly 
                            value={valentineLink} 
                            className="flex-1 bg-gray-50 border border-gray-200 text-gray-600 text-sm rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                        <button 
                            onClick={copyLink}
                            className="px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                            title="Copy Link"
                        >
                            <Copy className="w-5 h-5" />
                            <span>Copy</span>
                        </button>
                    </div>
                    
                    <a 
                        href={valentineLink}
                        target="_blank"
                        className="w-full py-3 bg-pink-50 text-pink-600 font-bold rounded-lg hover:bg-pink-100 transition-colors flex items-center justify-center gap-2 border border-pink-200"
                    >
                        <ExternalLink className="w-5 h-5" />
                        <span>Preview Card (See what they see)</span>
                    </a>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                    <strong>Step 1:</strong> Copy the link above.<br/>
                    <strong>Step 2:</strong> Send it to your valentine.<br/>
                    <strong>Step 3:</strong> Wait on this page to see their answer!
                </p>

            <div className="border-t border-gray-100 pt-8 text-center">
                <h3 className="text-gray-900 font-semibold mb-4">Current Status</h3>
                
                {loading && !status ? (
                    <div className="animate-pulse flex justify-center">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </div>
                ) : (
                    <div className={`inline-flex flex-col items-center justify-center p-6 rounded-2xl transition-all ${
                        status === 'yes' ? 'bg-green-50 text-green-600' :
                        status === 'no' ? 'bg-red-50 text-red-600' :
                        'bg-yellow-50 text-yellow-600'
                    }`}>
                        {status === 'yes' && <Heart className="w-12 h-12 mb-2 fill-current animate-bounce" />}
                        {status === 'no' && <span className="text-4xl mb-2">💔</span>}
                        {status === 'waiting' && <RefreshCw className="w-12 h-12 mb-2 animate-spin" />}
                        
                        <span className="text-xl font-bold uppercase tracking-wider">
                            {status === 'waiting' ? 'Waiting...' : `They said ${status}!`}
                        </span>
                    </div>
                )}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-4 text-center">
                <Link 
                    to="/" 
                    className="inline-flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                    <Heart className="w-4 h-4" />
                    <span>Create Another Card</span>
                </Link>
                <span className="text-xs text-gray-400">
                    Status updates automatically every 5 seconds.
                </span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TrackerPage;
