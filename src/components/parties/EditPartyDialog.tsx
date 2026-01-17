import { useState, useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUpdateParty, Party } from '@/hooks/useParties';

interface EditPartyDialogProps {
  party: Party;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditPartyDialog = ({ party, open, onOpenChange }: EditPartyDialogProps) => {
  const updateParty = useUpdateParty();
  const [formData, setFormData] = useState({
    name: party.name,
    address: party.address || '',
    phone: party.phone || '',
    email: party.email || '',
    station: party.station || '',
  });

  useEffect(() => {
    setFormData({
      name: party.name,
      address: party.address || '',
      phone: party.phone || '',
      email: party.email || '',
      station: party.station || '',
    });
  }, [party]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    try {
      await updateParty.mutateAsync({ id: party.id, ...formData });
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Party</DialogTitle>
          <DialogDescription>
            Update party information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Party Name *</label>
            <input
              type="text"
              placeholder="Enter party/company name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label-text">Address</label>
            <textarea
              placeholder="Enter full address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="input-field min-h-[80px] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">Phone</label>
              <input
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-text">Email</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="label-text">Default Station</label>
            <input
              type="text"
              placeholder="Delivery station/city"
              value={formData.station}
              onChange={(e) => handleInputChange('station', e.target.value)}
              className="input-field"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateParty.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateParty.isPending || !formData.name.trim()}>
              {updateParty.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPartyDialog;
