'use client';

import { useCallback, useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Music, Disc, User } from 'lucide-react';
import { MusicBrainzTree, MusicBrainzTreeNode } from '@/lib/musicbrainz-tree';
import Image from 'next/image';

interface TreeViewProps {
  tree: MusicBrainzTree;
  onSelectNode: (nodeId: string) => void;
  selectedNodeId?: string;
  isLoading?: Record<string, boolean>;
  coverArtMap?: Record<string, string>;
}

export const TreeView = ({ 
  tree, 
  onSelectNode, 
  selectedNodeId,
  isLoading = {},
  coverArtMap = {} 
}: TreeViewProps) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchFilter, setSearchFilter] = useState<string>('');
  
  // Auto-expand a node's parents
  useEffect(() => {
    if (selectedNodeId) {
      let currentNode = tree.nodes[selectedNodeId];
      while (currentNode && currentNode.parent) {
        setExpandedNodes(prev => {
          const newSet = new Set(prev);
          newSet.add(currentNode.parent!);
          return newSet;
        });
        currentNode = tree.nodes[currentNode.parent];
      }
    }
  }, [selectedNodeId, tree.nodes]);

  const toggleNode = useCallback((nodeId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);
  
  // Filter nodes based on search
  const filterNodes = useCallback((nodeId: string): boolean => {
    if (!searchFilter.trim()) return true;
    
    const node = tree.nodes[nodeId];
    if (!node) return false;
    
    // Check if this node matches the filter
    const nodeMatches = node.name.toLowerCase().includes(searchFilter.toLowerCase());
    if (nodeMatches) return true;
    
    // If not, check if any children match
    for (const childId of node.children) {
      if (filterNodes(childId)) return true;
    }
    
    return false;
  }, [searchFilter, tree.nodes]);

  const renderTreeNode = useCallback((nodeId: string, level: number = 0) => {
    const node = tree.nodes[nodeId];
    if (!node) return null;
    
    // Filter nodes if search filter is active
    if (searchFilter && !filterNodes(nodeId)) return null;
    
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes.has(nodeId);
    const isSelected = selectedNodeId === nodeId;
    
    // Skip rendering placeholder/system nodes
    if (node.id === 'artist-unknown' || node.id === 'album-unknown') {
      return null;
    }
    
    return (
      <div key={nodeId} className="select-none">
        <div 
          className={`flex items-center py-1 px-1 rounded hover:bg-zinc-800 cursor-pointer ${isSelected ? 'bg-zinc-800' : ''}`}
          style={{ paddingLeft: `${level * 16}px` }}
          onClick={() => onSelectNode(nodeId)}
        >
          {hasChildren && (
            <button
              onClick={(e) => toggleNode(nodeId, e)}
              className="mr-1 p-1 rounded hover:bg-zinc-700"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          
          {!hasChildren && (
            <div className="w-6" />
          )}
          
          {node.type === 'artist' && (
            <User className="h-4 w-4 mr-2 text-blue-400" />
          )}
          
          {node.type === 'album' && (
            <>
              {coverArtMap[nodeId] ? (
                <div className="h-5 w-5 mr-2 relative overflow-hidden rounded">
                  <Image 
                    src={coverArtMap[nodeId]} 
                    alt={node.name}
                    width={20}
                    height={20}
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <Disc className="h-4 w-4 mr-2 text-purple-400" />
              )}
            </>
          )}
          
          {node.type === 'song' && (
            <Music className="h-4 w-4 mr-2 text-green-400" />
          )}
          
          <span className="truncate">
            {searchFilter ? highlightMatch(node.name, searchFilter) : node.name}
          </span>
          
          {node.type === 'album' && node.details.date && (
            <span className="ml-2 text-xs text-zinc-500">
              ({node.details.date.split('-')[0]})
            </span>
          )}
          
          {node.type === 'song' && node.details.length && (
            <span className="ml-2 text-xs text-zinc-500">
              {formatDuration(node.details.length)}
            </span>
          )}
          
          {isLoading[nodeId] && (
            <div className="ml-2 h-3 w-3 rounded-full border-2 border-t-transparent border-blue-500 animate-spin"></div>
          )}
        </div>
        
        {isExpanded && hasChildren && (
          <div className="pl-2">
            {node.children.map((childId) => renderTreeNode(childId, level + 1))}
          </div>
        )}
      </div>
    );
  }, [tree, expandedNodes, selectedNodeId, toggleNode, onSelectNode, isLoading, coverArtMap]);
  
  const formatDuration = (ms: number) => {
    if (!ms) return '--:--';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Helper to highlight matching text in search results
  const highlightMatch = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <span key={i} className="bg-blue-800/40 text-blue-200">{part}</span> 
            : part
        )}
      </>
    );
  };
  
  return (
    <div>
      <div className="mb-2">
        <input
          type="text"
          placeholder="Filter results..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
        />
      </div>
      
      <div className="overflow-auto max-h-[500px] pr-2">
        {tree.rootIds.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            No results found
          </div>
        ) : searchFilter && tree.rootIds.every(rootId => !filterNodes(rootId)) ? (
          <div className="text-center py-8 text-zinc-500">
            No matching results for "{searchFilter}"
          </div>
        ) : (
          <>
            {searchFilter && (
              <div className="mb-2 text-xs text-zinc-500">
                Showing filtered results for "{searchFilter}"
              </div>
            )}
            {tree.rootIds.map((rootId) => renderTreeNode(rootId))}
          </>
        )}
      </div>
      
      {tree.rootIds.length > 0 && (
        <div className="mt-2 flex justify-between text-xs text-zinc-500">
          <button 
            onClick={() => setExpandedNodes(new Set())} 
            className="hover:text-zinc-300"
          >
            Collapse All
          </button>
          <button 
            onClick={() => {
              const allNodes = new Set<string>();
              // Add all possible nodes to expand
              Object.entries(tree.nodes).forEach(([id, node]) => {
                if (node.children.length > 0) {
                  allNodes.add(id);
                }
              });
              setExpandedNodes(allNodes);
            }} 
            className="hover:text-zinc-300"
          >
            Expand All
          </button>
        </div>
      )}
    </div>
  );
};