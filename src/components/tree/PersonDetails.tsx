
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Person } from "@/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Edit, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PersonDetailsProps {
  person: Person | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const PersonDetails = ({ person, isOpen, onClose, onEdit, onDelete }: PersonDetailsProps) => {
  const [showDeathInfo, setShowDeathInfo] = useState(false);
  const [showMaidenName, setShowMaidenName] = useState(false);
  const { t } = useTranslation();
  
  if (!person) return null;
  
  // Format date display
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-asli-navy">
            {person.firstName} {person.lastName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <h3 className="text-sm font-medium text-gray-500">First Name</h3>
              <p>{person.firstName}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Name</h3>
              <p>{person.lastName}</p>
            </div>
            
            {person.gender === "female" && (
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="h-6 p-0"
                    onClick={() => setShowMaidenName(!showMaidenName)}
                  >
                    {showMaidenName ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    <span className="text-sm font-medium text-gray-500">{t('Maiden Name')}</span>
                  </Button>
                </div>
                
                {showMaidenName && person.maidenName && (
                  <p className="mt-1">{person.maidenName}</p>
                )}
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('Gender')}</h3>
              <p className="capitalize">{person.gender}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('Occupation')}</h3>
              <p>{person.occupation || t('Not specified')}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('Birth Date')}</h3>
              <p>{formatDate(person.birthDate) || t('Not specified')}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('Birth Place')}</h3>
              <p>{person.birthPlace || t('Not specified')}</p>
            </div>
            
            <div className="col-span-2">
              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="h-6 p-0"
                  onClick={() => setShowDeathInfo(!showDeathInfo)}
                >
                  {showDeathInfo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  <span className="text-sm font-medium text-gray-500">{t('Death Information')}</span>
                </Button>
              </div>
              
              {showDeathInfo && (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">{t('Death Date')}</h3>
                    <p>{formatDate(person.deathDate) || t('Not specified')}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">{t('Death Place')}</h3>
                    <p>{person.deathPlace || t('Not specified')}</p>
                  </div>
                </div>
              )}
            </div>
            
            {person.notes && (
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-gray-500">{t('Notes')}</h3>
                <p className="whitespace-pre-wrap">{person.notes}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between mt-2">
          <Button 
            variant="outline" 
            onClick={onEdit}
            className="flex gap-2"
          >
            <Edit size={16} />
            {t('Edit')}
          </Button>
          
          <Button 
            variant="destructive" 
            onClick={onDelete}
            className="flex gap-2"
          >
            <Trash2 size={16} />
            {t('Delete')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PersonDetails;
