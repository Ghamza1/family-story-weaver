
import { useFamilyTree } from "@/context/FamilyTreeContext";
import TreeCanvas from "@/components/tree/TreeCanvas";
import { useTranslation } from "react-i18next";

const TreeDetails = () => {
  const { selectedTree } = useFamilyTree();
  const { t } = useTranslation();
  
  if (!selectedTree) {
    return (
      <div className="flex items-center justify-center h-full bg-asli-beige/30">
        <div className="text-center max-w-md px-4">
          <h2 className="text-xl font-semibold text-asli-navy mb-2">{t('No Tree Selected')}</h2>
          <p className="text-asli-gray mb-4">
            {t('Select a tree from the sidebar or create a new one to get started.')}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
        <h2 className="font-semibold text-asli-navy">
          {selectedTree.name}
        </h2>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <TreeCanvas />
      </div>
    </div>
  );
};

export default TreeDetails;
