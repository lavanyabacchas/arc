import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Search, 
  Filter, 
  LayoutGrid, 
  Table as TableIcon, 
  ArrowUpDown, 
  AlertTriangle, 
  CheckCircle, 
  Radio, 
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Zap,
  Droplet,
  Train,
  Cpu
} from 'lucide-react';
import { fetchAssets } from '../api';
import { Asset } from '../types';

interface InfrastructureViewProps {
  onSelectAsset: (assetId: string) => void;
}

export const InfrastructureView: React.FC<InfrastructureViewProps> = ({ onSelectAsset }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('risk_desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  const loadAssets = () => {
    setLoading(true);
    fetchAssets({
      search,
      sector: sectorFilter,
      status: statusFilter,
      sort_by: sortBy
    })
      .then(res => setAssets(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAssets();
  }, [search, sectorFilter, statusFilter, sortBy]);

  const sectors = ['all', 'Energy', 'Water & Waste', 'IT & Cloud', 'Communications', 'Transportation'];
  const statuses = ['all', 'healthy', 'degraded', 'threat_detected', 'isolated', 'offline'];

  const getSectorIcon = (sector: string) => {
    switch (sector.toLowerCase()) {
      case 'energy': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'water & waste': return <Droplet className="w-4 h-4 text-cyan-400" />;
      case 'it & cloud': return <Server className="w-4 h-4 text-blue-400" />;
      case 'communications': return <Radio className="w-4 h-4 text-indigo-400" />;
      case 'transportation': return <Train className="w-4 h-4 text-emerald-400" />;
      default: return <Cpu className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#EAF2FF] tracking-tight">Critical Infrastructure Assets</h2>
          <p className="text-xs text-[#91A6C4] mt-0.5">
            Operational technology (OT) asset inventory, telemetry status, and cyber risk indices
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#0B1B30] border border-[#203651] p-1 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-[#10243D] text-[#3B82F6]' : 'text-[#91A6C4] hover:text-[#EAF2FF]'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-[#10243D] text-[#3B82F6]' : 'text-[#91A6C4] hover:text-[#EAF2FF]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={loadAssets}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B1B30] hover:bg-[#10243D] border border-[#203651] text-xs text-[#91A6C4] hover:text-[#EAF2FF] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#0B1B30] border border-[#203651] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#91A6C4] absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by asset name, ID..."
              className="w-full bg-[#10243D] border border-[#203651] rounded-lg pl-9 pr-3 py-2 text-xs text-[#EAF2FF] placeholder-[#627D98] focus:outline-none focus:border-[#3B82F6]"
            />
          </div>

          {/* Sector Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#91A6C4] whitespace-nowrap">Sector:</span>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full bg-[#10243D] border border-[#203651] rounded-lg px-2.5 py-2 text-xs text-[#EAF2FF] focus:outline-none focus:border-[#3B82F6] cursor-pointer"
            >
              {sectors.map(s => (
                <option key={s} value={s}>{s === 'all' ? 'All Sectors' : s}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#91A6C4] whitespace-nowrap">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#10243D] border border-[#203651] rounded-lg px-2.5 py-2 text-xs text-[#EAF2FF] focus:outline-none focus:border-[#3B82F6] cursor-pointer capitalize"
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#91A6C4] whitespace-nowrap">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-[#10243D] border border-[#203651] rounded-lg px-2.5 py-2 text-xs text-[#EAF2FF] focus:outline-none focus:border-[#3B82F6] cursor-pointer"
            >
              <option value="risk_desc">Highest Risk Score</option>
              <option value="name_asc">Asset Name (A-Z)</option>
              <option value="id_asc">Asset ID (AST-xxx)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Asset Content */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-[#91A6C4] space-y-3">
          <div className="w-8 h-8 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs">Loading infrastructure assets...</span>
        </div>
      ) : assets.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#0B1B30] border border-[#203651] text-xs text-[#91A6C4]">
          No assets match the selected filters.
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="rounded-2xl bg-[#0B1B30] border border-[#203651] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#203651] bg-[#10243D]/50 text-[#91A6C4] text-[10px] uppercase font-semibold">
                  <th className="py-3 px-4">Asset ID</th>
                  <th className="py-3 px-4">Asset Name</th>
                  <th className="py-3 px-4">Sector</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#203651]/40">
                {assets.map((asset) => (
                  <tr 
                    key={asset.id} 
                    onClick={() => onSelectAsset(asset.id)}
                    className="hover:bg-[#10243D]/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-[#3B82F6]">
                      {asset.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getSectorIcon(asset.sector)}
                        <span className="font-semibold text-[#EAF2FF] group-hover:text-[#3B82F6] transition-colors">
                          {asset.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#91A6C4]">
                      {asset.sector}
                    </td>
                    <td className="py-3 px-4 text-[#91A6C4] max-w-xs truncate">
                      {asset.type}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                        asset.status === 'threat_detected' ? 'bg-rose-500/20 text-[#FB7185] border border-rose-500/30' :
                        asset.status === 'degraded' ? 'bg-amber-500/20 text-[#FBBF24] border border-amber-500/30' :
                        asset.status === 'isolated' ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' :
                        'bg-emerald-500/20 text-[#34D399] border border-emerald-500/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          asset.status === 'threat_detected' ? 'bg-[#FB7185] animate-pulse' :
                          asset.status === 'degraded' ? 'bg-[#FBBF24]' :
                          asset.status === 'isolated' ? 'bg-gray-400' : 'bg-[#34D399]'
                        }`} />
                        <span>{asset.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className={`font-bold ${
                        asset.risk_score > 60 ? 'text-[#FB7185]' :
                        asset.risk_score > 30 ? 'text-[#FBBF24]' : 'text-[#34D399]'
                      }`}>
                        {asset.risk_score}
                      </span>
                      <span className="text-[10px] text-[#627D98]"> /100</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#91A6C4] text-[11px]">
                      {asset.ip_address}
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-[#3B82F6] hover:text-white p-1 rounded hover:bg-[#3B82F6]/20 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => onSelectAsset(asset.id)}
              className="p-4 rounded-xl bg-[#0B1B30] border border-[#203651] hover:border-[#3B82F6]/60 shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#10243D] text-[#3B82F6] border border-[#203651]">
                    {asset.id}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${
                    asset.status === 'threat_detected' ? 'bg-[#FB7185] animate-ping' :
                    asset.status === 'degraded' ? 'bg-[#FBBF24]' :
                    asset.status === 'isolated' ? 'bg-gray-400' : 'bg-[#34D399]'
                  }`} />
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#10243D] border border-[#203651] text-[#3B82F6]">
                    {getSectorIcon(asset.sector)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#EAF2FF] group-hover:text-[#3B82F6] transition-colors">
                      {asset.name}
                    </h4>
                    <p className="text-[10px] text-[#91A6C4]">{asset.sector}</p>
                  </div>
                </div>

                <p className="text-[11px] text-[#91A6C4] mt-3 line-clamp-2 leading-relaxed">
                  {asset.type}
                </p>
              </div>

              <div className="pt-3 border-t border-[#203651]/60 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[10px] text-[#627D98] block">Risk Score</span>
                  <span className={`font-bold ${
                    asset.risk_score > 60 ? 'text-[#FB7185]' :
                    asset.risk_score > 30 ? 'text-[#FBBF24]' : 'text-[#34D399]'
                  }`}>
                    {asset.risk_score}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#627D98] block">IPv4</span>
                  <span className="text-[#91A6C4] text-[11px]">{asset.ip_address}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
