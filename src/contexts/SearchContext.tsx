import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PREDEFINED_TAGS } from '@/constants/tags';

interface Catbot {
  id: string;
  name: string;
  description: string | null;
  public_profile?: string | null;
  avatar_url: string | null;
  is_public: boolean;
  created_at: string;
  like_count?: number;
  interaction_count?: number;
  tags?: string[];
}

interface SearchContextType {
  searchQuery: string;
  selectedTags: string[];
  availableTags: string[];
  filteredCatbots: Catbot[];
  allCatbots: Catbot[];
  isSearching: boolean;
  loading: boolean;
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  clearSearch: () => void;
  loadCatbots: () => Promise<void>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [allCatbots, setAllCatbots] = useState<Catbot[]>([]);
  const [filteredCatbots, setFilteredCatbots] = useState<Catbot[]>([]);
  const [loading, setLoading] = useState(true);

  const isSearching = searchQuery.trim() !== "" || selectedTags.length > 0;

  const loadCatbots = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('catbots')
        .select('id, name, description, public_profile, avatar_url, created_at, updated_at, is_public, like_count, interaction_count, tags')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const catbots = data || [];
      setAllCatbots(catbots);
      
      // Use predefined tags instead of extracting from catbots
      setAvailableTags([...PREDEFINED_TAGS]);
    } catch (error) {
      console.error('Error loading catbots:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedTags([]);
  };

  // Filter catbots based on search criteria
  useEffect(() => {
    if (isSearching) {
      let filtered = allCatbots;

      // Filter by search query
      if (searchQuery.trim() !== "") {
        filtered = filtered.filter(catbot => 
          catbot.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (catbot.description && catbot.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (catbot.public_profile && catbot.public_profile.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      // Filter by selected tags
      if (selectedTags.length > 0) {
        filtered = filtered.filter(catbot => 
          catbot.tags && catbot.tags.some(tag => selectedTags.includes(tag))
        );
      }

      setFilteredCatbots(filtered);
    }
  }, [allCatbots, searchQuery, selectedTags, isSearching]);

  // Load catbots on mount
  useEffect(() => {
    loadCatbots();
  }, []);

  const value: SearchContextType = {
    searchQuery,
    selectedTags,
    availableTags,
    filteredCatbots,
    allCatbots,
    isSearching,
    loading,
    setSearchQuery,
    setSelectedTags,
    clearSearch,
    loadCatbots,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};