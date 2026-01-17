import { useState } from 'react';
import { Check, ChevronsUpDown, UserPlus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useParties, Party } from '@/hooks/useParties';

interface PartySelectorProps {
  selectedPartyId?: string;
  onSelect: (party: Party | null) => void;
  onAddNew: () => void;
}

const PartySelector = ({ selectedPartyId, onSelect, onAddNew }: PartySelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: parties = [], isLoading } = useParties();

  const selectedParty = parties.find((p) => p.id === selectedPartyId);

  const filteredParties = parties.filter((party) =>
    party.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-[42px] py-2 text-left font-normal"
        >
          {selectedParty ? (
            <div className="flex flex-col items-start">
              <span className="font-medium">{selectedParty.name}</span>
              {selectedParty.station && (
                <span className="text-xs text-muted-foreground">{selectedParty.station}</span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">Select a party or add new...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search parties..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? (
                <span className="text-muted-foreground">Loading...</span>
              ) : (
                <div className="py-2 text-center">
                  <p className="text-sm text-muted-foreground mb-2">No party found</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setOpen(false);
                      onAddNew();
                    }}
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Add New Party
                  </Button>
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {/* Clear selection option */}
              {selectedPartyId && (
                <CommandItem
                  value="__clear__"
                  onSelect={() => {
                    onSelect(null);
                    setOpen(false);
                    setSearchQuery('');
                  }}
                  className="text-muted-foreground"
                >
                  <span className="italic">Clear selection (enter manually)</span>
                </CommandItem>
              )}
              {/* Add new party option */}
              <CommandItem
                value="__add_new__"
                onSelect={() => {
                  setOpen(false);
                  onAddNew();
                }}
                className="text-primary"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                <span className="font-medium">Add New Party</span>
              </CommandItem>
              {/* Party list */}
              {filteredParties.map((party) => (
                <CommandItem
                  key={party.id}
                  value={party.id}
                  onSelect={() => {
                    onSelect(party);
                    setOpen(false);
                    setSearchQuery('');
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedPartyId === party.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{party.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {[party.station, party.phone].filter(Boolean).join(' • ')}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default PartySelector;
