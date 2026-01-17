import { useState } from 'react';
import { Search, UserPlus, Pencil, Trash2, MapPin, Phone, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParties, useDeleteParty, Party } from '@/hooks/useParties';
import AddPartyDialog from '@/components/parties/AddPartyDialog';
import EditPartyDialog from '@/components/parties/EditPartyDialog';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Parties = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [deletingParty, setDeletingParty] = useState<Party | null>(null);
  
  const { data: parties = [], isLoading } = useParties();
  const deleteParty = useDeleteParty();
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const filteredParties = parties.filter((party) =>
    party.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    party.station?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    party.phone?.includes(searchQuery)
  );

  const handleDelete = async () => {
    if (!deletingParty) return;
    await deleteParty.mutateAsync(deletingParty.id);
    setDeletingParty(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Parties</h1>
          <p className="text-muted-foreground text-sm">Manage your customers and suppliers</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add Party
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, station, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Parties List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredParties.length === 0 ? (
        <div className="bg-card rounded-xl p-8 text-center">
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'No parties match your search' : 'No parties added yet'}
          </p>
          <Button variant="outline" onClick={() => setAddDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add First Party
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredParties.map((party) => (
            <div
              key={party.id}
              className="bg-card rounded-xl shadow-card p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-foreground text-lg">{party.name}</h3>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingParty(party)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingParty(party)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                {party.station && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{party.station}</span>
                  </div>
                )}
                {party.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-teal" />
                    <a href={`tel:${party.phone}`} className="hover:underline">
                      {party.phone}
                    </a>
                  </div>
                )}
                {party.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-copper" />
                    <a href={`mailto:${party.email}`} className="hover:underline truncate">
                      {party.email}
                    </a>
                  </div>
                )}
                {party.address && (
                  <p className="text-xs pt-2 border-t border-border line-clamp-2">
                    {party.address}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Party Dialog */}
      <AddPartyDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

      {/* Edit Party Dialog */}
      {editingParty && (
        <EditPartyDialog
          party={editingParty}
          open={!!editingParty}
          onOpenChange={(open) => !open && setEditingParty(null)}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingParty} onOpenChange={(open) => !open && setDeletingParty(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Party</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingParty?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteParty.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Parties;
