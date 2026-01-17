import { useState } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateParty, CreatePartyData, Party } from '@/hooks/useParties';

interface AddPartyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (party: Party) => void;
  initialData?: Partial<CreatePartyData>;
}

const AddPartyDialog = ({ open, onOpenChange, onSuccess, initialData }: AddPartyDialogProps) => {
  const createParty = useCreateParty();
  const [formData, setFormData] = useState<CreatePartyData>({
    name: initialData?.name || '',
    address: initialData?.address || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    station: initialData?.station || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    try {
      const newParty = await createParty.mutateAsync(formData);
      onOpenChange(false);
      setFormData({ name: '', address: '', phone: '', email: '', station: '' });
      onSuccess?.(newParty);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleInputChange = (field: keyof CreatePartyData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Add New Party
          </DialogTitle>
          <DialogDescription>
            Save party details for quick selection in future orders.
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
              autoFocus
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
              disabled={createParty.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createParty.isPending || !formData.name.trim()}>
              {createParty.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              Save Party
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPartyDialog;
