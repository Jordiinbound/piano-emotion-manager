/**
 * Store Page - Elegant Design
 * Piano Emotion Manager
 * 
 * Diseño elegante y profesional para tienda de componentes de piano premium
 * Replicando el diseño del drawer original
 */

import { useState } from 'react';
import { Package } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

type TabType = 'products' | 'blog';

export default function Store() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  const categories = [
    { id: 'macillos', name: t('store.categories.hammers'), description: t('store.categories.hammersDesc') },
    { id: 'cuerdas', name: t('store.categories.strings'), description: t('store.categories.stringsDesc') },
    { id: 'fieltros', name: t('store.categories.felts'), description: t('store.categories.feltsDesc') },
    { id: 'llaves', name: t('store.categories.tuningKeys'), description: t('store.categories.tuningKeysDesc') },
    { id: 'herramientas', name: t('store.categories.tools'), description: t('store.categories.toolsDesc') },
    { id: 'adhesivos', name: t('store.categories.adhesives'), description: t('store.categories.adhesivesDesc') },
    { id: 'mantenimiento', name: t('store.categories.maintenance'), description: t('store.categories.maintenanceDesc') },
    { id: 'clavijas', name: t('store.categories.pins'), description: t('store.categories.pinsDesc') },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'products'
                  ? 'border-[#003a8c] text-[#003a8c]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('store.tabs.products')}
            </button>
            <button
              onClick={() => setActiveTab('blog')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'blog'
                  ? 'border-[#003a8c] text-[#003a8c]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('store.tabs.blog')}
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'products' ? (
        <>
          {/* Categorías */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t('store.categoriesTitle')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(
                    selectedCategory === category.id ? undefined : category.id
                  )}
                  className={`p-6 rounded-lg border transition-all text-left ${
                    selectedCategory === category.id
                      ? 'bg-[#003a8c] border-[#003a8c] shadow-md'
                      : 'bg-white border-gray-200 hover:shadow-sm'
                  }`}
                >
                  <h3 className={`text-lg font-semibold mb-2 ${
                    selectedCategory === category.id ? 'text-white' : 'text-gray-900'
                  }`}>
                    {category.name}
                  </h3>
                  <p className={`text-sm ${
                    selectedCategory === category.id
                      ? 'text-white/90'
                      : 'text-gray-600'
                  }`}>
                    {category.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Estado vacío - Próximamente */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6 shadow-sm">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">{t('store.comingSoon')}</h3>
              <p className="text-base text-gray-600 max-w-md">
                {t('store.comingSoonDesc')}
              </p>
            </div>
          </div>
        </>
      ) : (
        /* Blog - Próximamente */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6 shadow-sm">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">{t('store.blogComingSoon')}</h3>
            <p className="text-base text-gray-600 max-w-md">
              {t('store.blogComingSoonDesc')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
