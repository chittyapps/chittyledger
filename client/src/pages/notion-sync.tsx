import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Database, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Clock, 
  Shield,
  Eye,
  FileText,
  ChevronRight,
  Settings,
  Activity
} from "lucide-react";

export default function NotionSync() {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSync, setLastSync] = useState<Date | null>(new Date());
  const [evidenceCount, setEvidenceCount] = useState(847);

  const handleSync = () => {
    setSyncStatus('syncing');
    
    // Simulate sync process
    setTimeout(() => {
      setSyncStatus('success');
      setLastSync(new Date());
      setEvidenceCount(prev => prev + Math.floor(Math.random() * 10));
    }, 3000);
  };

  const syncConfigs = [
    {
      title: "Evidence Items",
      description: "Master evidence repository sync",
      status: "active",
      lastSync: "2 minutes ago",
      count: evidenceCount,
      icon: FileText
    },
    {
      title: "Chain of Custody",
      description: "Immutable audit trail records",
      status: "active", 
      lastSync: "5 minutes ago",
      count: 234,
      icon: Shield
    },
    {
      title: "Contradiction Analysis",
      description: "AI-detected evidence conflicts",
      status: "warning",
      lastSync: "1 hour ago", 
      count: 12,
      icon: Eye
    },
    {
      title: "Case Metadata",
      description: "Legal case information sync",
      status: "active",
      lastSync: "10 minutes ago",
      count: 45,
      icon: Database
    }
  ];

  return (
    <div className="min-h-screen p-8">
      {/* Header Section */}
      <div className="mb-12">
        <div className="glass-obsidian rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="legal-seal-premium w-16 h-16 rounded-full flex items-center justify-center">
                <Database className="w-8 h-8 text-obsidian-950" />
              </div>
              <div>
                <h1 className="font-legal text-4xl text-gradient-byzantium mb-2">Notion Integration</h1>
                <p className="text-obsidian-300 font-crimson">
                  Synchronize ChittyChain evidence with your Notion workspace
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge className={`
                px-4 py-2 rounded-xl font-tech text-sm
                ${syncStatus === 'success' ? 'bg-emerald-verify-500/20 text-emerald-verify-500' : 
                  syncStatus === 'syncing' ? 'bg-gold-byzantium-500/20 text-gold-byzantium-500' : 
                  'bg-obsidian-700 text-obsidian-300'}
              `}>
                {syncStatus === 'success' && <CheckCircle className="w-4 h-4 mr-2" />}
                {syncStatus === 'syncing' && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                {syncStatus === 'idle' && <Clock className="w-4 h-4 mr-2" />}
                {syncStatus === 'success' ? 'Synchronized' : 
                 syncStatus === 'syncing' ? 'Syncing...' : 'Ready'}
              </Badge>
              
              <Button 
                onClick={handleSync}
                disabled={syncStatus === 'syncing'}
                className="glass-byzantium border-0 text-obsidian-950 px-6 py-3 rounded-xl font-semibold shadow-byzantium hover:shadow-void transition-all duration-500"
                data-testid="button-sync-notion"
              >
                <RefreshCw className={`w-5 h-5 mr-2 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                {syncStatus === 'syncing' ? 'Syncing' : 'Sync Now'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Status Dashboard */}
      <div className="grid grid-cols-12 gap-8 mb-12">
        <div className="col-span-8">
          <div className="space-y-6">
            <h2 className="font-legal text-2xl text-obsidian-100 mb-6">Sync Modules</h2>
            
            {syncConfigs.map((config, i) => {
              const Icon = config.icon;
              return (
                <div key={i} className="evidence-card-elite rounded-2xl p-6 animate-evidence-materialize" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center
                        ${config.status === 'active' ? 'bg-emerald-verify-500/20' : 
                          config.status === 'warning' ? 'bg-crimson-evidence-500/20' : 'bg-obsidian-700'}
                      `}>
                        <Icon className={`w-6 h-6 ${
                          config.status === 'active' ? 'text-emerald-verify-500' : 
                          config.status === 'warning' ? 'text-crimson-evidence-500' : 'text-obsidian-400'
                        }`} />
                      </div>
                      
                      <div>
                        <div className="font-legal text-lg text-obsidian-100">{config.title}</div>
                        <div className="font-tech text-sm text-obsidian-400">{config.description}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="font-tech text-2xl text-gold-byzantium-500">{config.count.toLocaleString()}</div>
                        <div className="text-xs text-obsidian-400">Items</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-tech text-sm text-obsidian-300">{config.lastSync}</div>
                        <div className="text-xs text-obsidian-500">Last Sync</div>
                      </div>
                      
                      <ChevronRight className="w-5 h-5 text-obsidian-600" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="col-span-4">
          <div className="space-y-6">
            <h2 className="font-legal text-2xl text-obsidian-100 mb-6">Sync Activity</h2>
            
            <div className="glass-obsidian rounded-2xl p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-tech text-lg text-obsidian-200">Real-time Monitoring</div>
                  <Activity className="w-5 h-5 text-gold-byzantium-500" />
                </div>
                
                <div className="space-y-3 font-tech text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-verify-500 rounded-full animate-pulse"></div>
                    <span className="text-obsidian-300">Evidence sync: Active</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gold-byzantium-500 rounded-full"></div>
                    <span className="text-obsidian-300">Database: Connected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-crimson-evidence-500 rounded-full"></div>
                    <span className="text-obsidian-300">Conflicts: 3 pending</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="glass-obsidian rounded-2xl p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-tech text-lg text-obsidian-200">Configuration</div>
                  <Settings className="w-5 h-5 text-gold-byzantium-500" />
                </div>
                
                <div className="space-y-3">
                  <div className="text-sm text-obsidian-400">
                    <div className="font-tech">Database ID:</div>
                    <div className="font-tech text-gold-byzantium-500 mt-1">24694de4357980dba689cf778c9708eb</div>
                  </div>
                  
                  <div className="text-sm text-obsidian-400">
                    <div className="font-tech">Sync Interval:</div>
                    <div className="font-tech text-obsidian-300 mt-1">Every 5 minutes</div>
                  </div>
                  
                  <div className="text-sm text-obsidian-400">
                    <div className="font-tech">Last Full Sync:</div>
                    <div className="font-tech text-obsidian-300 mt-1">
                      {lastSync ? lastSync.toLocaleString() : 'Never'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Button className="w-full glass-obsidian border border-gold-byzantium-500/30 text-gold-byzantium-500 py-3 rounded-xl font-semibold hover:glass-byzantium/20 transition-all duration-500">
              <Settings className="w-5 h-5 mr-2" />
              Configure Sync
            </Button>
          </div>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="glass-obsidian rounded-2xl p-8">
        <div className="font-tech text-sm text-obsidian-400 mb-4">chittychain://notion-sync-log</div>
        
        <div className="space-y-2 font-tech text-sm max-h-64 overflow-y-auto">
          <div className="flex items-center space-x-2">
            <span className="text-emerald-verify-500">$</span>
            <span className="text-obsidian-200">notion-sync --database 24694de4357980dba689cf778c9708eb</span>
          </div>
          <div className="text-gold-byzantium-500">→ Connecting to Notion API...</div>
          <div className="text-emerald-verify-500">→ Connection established</div>
          <div className="text-obsidian-300">→ Fetching evidence records...</div>
          <div className="text-gold-byzantium-500">→ Processing {evidenceCount} evidence items</div>
          <div className="text-emerald-verify-500">→ Blockchain verification: PASSED</div>
          <div className="text-obsidian-300">→ Updating Notion database...</div>
          {syncStatus === 'success' && (
            <>
              <div className="text-emerald-verify-500">→ Sync completed successfully</div>
              <div className="text-obsidian-300">→ {evidenceCount} records synchronized</div>
            </>
          )}
          {syncStatus === 'syncing' && (
            <div className="text-gold-byzantium-500 animate-pulse">→ Synchronization in progress...</div>
          )}
          
          <div className="pt-2">
            <span className="text-gold-byzantium-500 animate-pulse">█</span>
          </div>
        </div>
      </div>
    </div>
  );
}