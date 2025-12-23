import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, MapPin, GraduationCap, Briefcase, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FRATERNITIES, INDUSTRIES } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const Search = () => {
  const [query, setQuery] = useState('');
  const [fratFilter, setFratFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const users: any[] = []; // Will be populated from Supabase

  const filteredUsers = users.filter(user => {
    const matchesQuery = user.name?.toLowerCase().includes(query.toLowerCase()) || 
                        user.university?.toLowerCase().includes(query.toLowerCase());
    const matchesFrat = !fratFilter || user.fraternity === fratFilter;
    const matchesIndustry = !industryFilter || user.industry === industryFilter;
    return matchesQuery && matchesFrat && matchesIndustry;
  });

  const handleConnect = (name: string) => {
    toast({ title: "Connection request sent!", description: `Your request to ${name} has been sent.` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Find Members</h1>
        <p className="text-muted-foreground">Search for brothers and sisters across chapters</p>
      </div>

      {/* Search & Filters */}
      <div className="card-premium p-4 space-y-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by name or university..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-11 bg-secondary/50 border-border/50"
          />
        </div>
        <div className="flex gap-3 flex-wrap">
          <Select value={fratFilter} onValueChange={setFratFilter}>
            <SelectTrigger className="w-48 bg-secondary/50"><SelectValue placeholder="All Organizations" /></SelectTrigger>
            <SelectContent className="max-h-60 bg-card">{FRATERNITIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger className="w-40 bg-secondary/50"><SelectValue placeholder="All Industries" /></SelectTrigger>
            <SelectContent className="bg-card">{INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
          </Select>
          {(fratFilter || industryFilter) && (
            <Button variant="ghost" onClick={() => { setFratFilter(''); setIndustryFilter(''); }}>Clear</Button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredUsers.map((user, i) => (
          <motion.div key={user.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card-premium p-4 hover-lift">
            <div className="flex gap-4">
              <Avatar className="h-14 w-14 ring-2 ring-primary/10">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <Link to={`/profile/${user.id}`} className="font-semibold text-foreground hover:text-primary transition-colors">{user.name}</Link>
                <p className="text-sm text-primary font-medium">{user.fraternity}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{user.university}</span>
                  {user.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{user.location}</span>}
                </div>
                {user.industry && <span className="inline-flex items-center gap-1 mt-2 text-xs bg-secondary px-2 py-1 rounded-full"><Briefcase className="h-3 w-3" />{user.industry}</span>}
              </div>
              <Button size="sm" variant="outline" className="shrink-0" onClick={() => handleConnect(user.name)}>
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No members found. Try adjusting your search criteria.</div>
      )}
    </div>
  );
};

export default Search;