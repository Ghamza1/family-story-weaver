
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Person } from "@/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";

interface EditPersonModalProps {
  person: Person;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPerson: Person) => void;
}

const EditPersonModal = ({ person, isOpen, onClose, onSave }: EditPersonModalProps) => {
  const [formData, setFormData] = useState<Person>({...person});
  const [showDeathInfo, setShowDeathInfo] = useState(!!person.deathDate || !!person.deathPlace);
  const { t } = useTranslation();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setShowDeathInfo(checked);
    if (!checked) {
      setFormData(prev => ({
        ...prev,
        deathDate: undefined,
        deathPlace: undefined
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{t('Edit Person')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('First Name')}</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">{t('Last Name')}</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            
            {formData.gender === "female" && (
              <div className="space-y-2">
                <Label htmlFor="maidenName">{t('Maiden Name')}</Label>
                <Input
                  id="maidenName"
                  name="maidenName"
                  value={formData.maidenName || ""}
                  onChange={handleChange}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="gender">{t('Gender')}</Label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
                required
              >
                <option value="male">{t('Male')}</option>
                <option value="female">{t('Female')}</option>
                <option value="other">{t('Other')}</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="occupation">{t('Occupation')}</Label>
              <Input
                id="occupation"
                name="occupation"
                value={formData.occupation || ""}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthDate">{t('Birth Date')}</Label>
              <Input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate || ""}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="birthPlace">{t('Birth Place')}</Label>
              <Input
                id="birthPlace"
                name="birthPlace"
                value={formData.birthPlace || ""}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="showDeathInfo" 
              checked={showDeathInfo}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="showDeathInfo">{t('Include Death Information')}</Label>
          </div>
          
          {showDeathInfo && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deathDate">{t('Death Date')}</Label>
                <Input
                  type="date"
                  id="deathDate"
                  name="deathDate"
                  value={formData.deathDate || ""}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deathPlace">{t('Death Place')}</Label>
                <Input
                  id="deathPlace"
                  name="deathPlace"
                  value={formData.deathPlace || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="notes">{t('Notes')}</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes || ""}
              onChange={handleChange}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>
              {t('Cancel')}
            </Button>
            <Button type="submit">
              {t('Save Changes')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPersonModal;
