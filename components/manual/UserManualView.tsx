import React, { useState, useMemo, FC } from 'react';
import { useTranslation } from '../../i18n';
import { Icon } from '../common/Icon';
import { GoogleGenAI } from '@google/genai';
import AIResponseModal from '../common/AIResponseModal';

interface UserManualViewProps {
    withApiKeyCheck: (action: () => Promise<void> | void) => void;
}

type Chapter = {
  id: string;
  titleKey: string;
  sections: { id: string; titleKey: string; contentKeys: string[] }[];
};

const CHAPTERS: Chapter[] = [
  {
    id: 'getting-started',
    titleKey: 'manual_chapter_1_title',
    sections: [
      { id: 'signup', titleKey: 'manual_chapter_1_section_1_title', contentKeys: ['manual_chapter_1_section_1_p1'] },
      { id: 'first-team', titleKey: 'manual_chapter_1_section_2_title', contentKeys: ['manual_chapter_1_section_2_p1'] },
      { id: 'navigation', titleKey: 'manual_chapter_1_section_3_title', contentKeys: ['manual_chapter_1_section_3_p1', 'manual_chapter_1_section_3_p2'] },
    ],
  },
  {
    id: 'recipes-menus',
    titleKey: 'manual_chapter_2_title',
    sections: [
      { id: 'recipe-crud', titleKey: 'manual_chapter_2_section_1_title', contentKeys: ['manual_chapter_2_section_1_p1'] },
      { id: 'ai-import', titleKey: 'manual_chapter_2_section_2_title', contentKeys: ['manual_chapter_2_section_2_p1'] },
      { id: 'ai-improve', titleKey: 'manual_chapter_2_section_3_title', contentKeys: ['manual_chapter_2_section_3_p1'] },
      { id: 'menu-management', titleKey: 'manual_chapter_2_section_4_title', contentKeys: ['manual_chapter_2_section_4_p1', 'manual_chapter_2_section_4_p2'] },
      { id: 'printing', titleKey: 'manual_chapter_2_section_5_title', contentKeys: ['manual_chapter_2_section_5_p1'] },
    ],
  },
  {
    id: 'inventory-costing',
    titleKey: 'manual_chapter_3_title',
    sections: [
      { id: 'inventory', titleKey: 'manual_chapter_3_section_1_title', contentKeys: ['manual_chapter_3_section_1_p1'] },
      { id: 'invoice-import', titleKey: 'manual_chapter_3_section_2_title', contentKeys: ['manual_chapter_3_section_2_p1'] },
      { id: 'suppliers', titleKey: 'manual_chapter_3_section_3_title', contentKeys: ['manual_chapter_3_section_3_p1'] },
      { id: 'costing', titleKey: 'manual_chapter_3_section_4_title', contentKeys: ['manual_chapter_3_section_4_p1'] },
      { id: 'shopping-list', titleKey: 'manual_chapter_3_section_5_title', contentKeys: ['manual_chapter_3_section_5_p1'] },
      { id: 'stock-waste', titleKey: 'manual_chapter_3_section_6_title', contentKeys: ['manual_chapter_3_section_6_p1'] },
    ],
  },
  {
    id: 'workflow',
    titleKey: 'manual_chapter_4_title',
    sections: [
      { id: 'workstations', titleKey: 'manual_chapter_4_section_1_title', contentKeys: ['manual_chapter_4_section_1_p1'] },
      { id: 'prep-tasks', titleKey: 'manual_chapter_4_section_2_title', contentKeys: ['manual_chapter_4_section_2_p1'] },
      { id: 'shifts', titleKey: 'manual_chapter_4_section_3_title', contentKeys: ['manual_chapter_4_section_3_p1'] },
    ],
  },
   {
    id: 'quality-safety',
    titleKey: 'manual_chapter_5_title',
    sections: [
      { id: 'haccp-logs', titleKey: 'manual_chapter_5_section_1_title', contentKeys: ['manual_chapter_5_section_1_p1'] },
      { id: 'haccp-printables', titleKey: 'manual_chapter_5_section_2_title', contentKeys: ['manual_chapter_5_section_2_p1'] },
      { id: 'labels', titleKey: 'manual_chapter_5_section_3_title', contentKeys: ['manual_chapter_5_section_3_p1'] },
    ],
  },
  {
    id: 'settings',
    titleKey: 'manual_chapter_6_title',
    sections: [
      { id: 'my-profile', titleKey: 'manual_chapter_6_section_1_title', contentKeys: ['manual_chapter_6_section_1_p1'] },
      { id: 'team-management', titleKey: 'manual_chapter_6_section_2_title', contentKeys: ['manual_chapter_6_section_2_p1'] },
      { id: 'roles-permissions', titleKey: 'manual_chapter_6_section_3_title', contentKeys: ['manual_chapter_6_section_3_p1'] },
      { id: 'workspace-settings', titleKey: 'manual_chapter_6_section_4_title', contentKeys: ['manual_chapter_6_section_4_p1'] },
    ],
  },
];

const FeedbackWidget: FC = () => {
    const { t } = useTranslation();
    const [feedbackSent, setFeedbackSent] = useState(false);

    if (feedbackSent) {
        return <p className="text-sm font-semibold text-green-600 dark:text-green-400">{t('manual_feedback_thanks')}</p>;
    }

    return (
        <div className="flex items-center gap-3 text-sm">
            <p className="font-semibold text-light-text-secondary dark:text-dark-text-secondary">{t('manual_feedback_prompt')}</p>
            <button onClick={() => setFeedbackSent(true)} className="p-1.5 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50 text-gray-500 hover:text-green-600 transition-colors">
                <Icon name="thumbs-up" className="w-5 h-5"/>
            </button>
            <button onClick={() => setFeedbackSent(true)} className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-gray-500 hover:text-red-600 transition-colors">
                <Icon name="thumbs-down" className="w-5 h-5"/>
            </button>
        </div>
    );
};

const ManualContent: FC = () => {
    const { t } = useTranslation();
    return (
        <div className="prose prose-lg dark:prose-invert max-w-none">
            {CHAPTERS.map(chapter => (
                <section key={chapter.id} id={chapter.id} className="mb-12">
                    <h2>{t(chapter.titleKey)}</h2>
                    {chapter.sections.map(section => (
                        <div key={section.id} className="mt-8">
                            <div className="flex items-center gap-4">
                               <h3 id={section.id}>{t(section.titleKey)}</h3>
                               {section.id === 'recipe-crud' && (
                                    <button onClick={() => alert(t('manual_interactive_tour_alert') + ` "${t(section.titleKey)}"`)} className="flex items-center gap-1.5 text-sm font-semibold text-brand-yellow hover:underline -mb-4">
                                        <Icon name="sparkles" className="w-4 h-4"/>
                                        {t('manual_show_me_how')}
                                    </button>
                               )}
                            </div>
                            {section.contentKeys.map(key => <p key={key}>{t(key)}</p>)}
                            
                            {section.id === 'invoice-import' && (
                                <div className="my-4 p-4 border-l-4 border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-center">
                                    <p className="font-semibold italic text-blue-800 dark:text-blue-200">{t('manual_video_placeholder')}</p>
                                </div>
                            )}
                            <div className="mt-6 border-t border-gray-200/80 dark:border-gray-700/80 pt-4">
                                <FeedbackWidget />
                            </div>
                        </div>
                    ))}
                </section>
            ))}
        </div>
    );
}

const UserManualView: React.FC<UserManualViewProps> = ({ withApiKeyCheck }) => {
  const { t } = useTranslation();
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const fullManualText = useMemo(() => {
    return CHAPTERS.flatMap(c => 
        [t(c.titleKey), ...c.sections.flatMap(s => [t(s.titleKey), ...s.contentKeys.map(p => t(p))])]
    ).join('\n\n');
  }, [t]);

  const handleAiSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiSearchQuery.trim()) return;

    const searchAction = async () => {
        setIsAiModalOpen(true);
        setIsAiLoading(true);
        setAiResponse('');

        try {
            if (!process.env.API_KEY) {
                throw new Error("API_KEY is not configured.");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `You are a helpful assistant for the ChefStack application. Based ONLY on the following user manual content, answer the user's question concisely and in Greek. If the answer isn't in the manual, say that you don't have that information.
            
    User Question: "${aiSearchQuery}"

    Manual Content:
    ---
    ${fullManualText}
    ---`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            
            setAiResponse(response.text);

        } catch (error: any) {
            console.error("AI search failed:", error);
            const errorMessage = error.message.includes("API_KEY") 
                ? "Σφάλμα διαμόρφωσης: Το κλειδί API δεν έχει ρυθμιστεί. Παρακαλώ επικοινωνήστε με την υποστήριξη."
                : t('error_generic');
            setAiResponse(errorMessage);
        } finally {
            setIsAiLoading(false);
        }
    };

    withApiKeyCheck(searchAction);
  };


  return (
    <>
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl h-full flex flex-col">
            <div className="mb-6 pb-4 border-b border-gray-200/80 dark:border-gray-700/80">
                <h2 className="text-3xl font-extrabold font-heading mb-4">{t('manual_title')}</h2>
                <form onSubmit={handleAiSearch} className="relative">
                    <input
                        type="search"
                        value={aiSearchQuery}
                        onChange={e => setAiSearchQuery(e.target.value)}
                        placeholder={t('manual_ai_search_placeholder')}
                        className="w-full pl-12 pr-4 py-3 text-lg rounded-full bg-black/5 dark:bg-white/10 border-transparent focus:border-brand-yellow focus:shadow-aura-yellow"
                    />
                    <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                     <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-brand-dark text-white rounded-full font-semibold text-sm flex items-center gap-2 hover:opacity-90">
                        <Icon name="sparkles" className="w-4 h-4"/>
                        {t('manual_search_button')}
                     </button>
                </form>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-8 min-h-0">
                {/* Sidebar Navigation */}
                <aside className="md:col-span-1 h-full overflow-y-auto">
                    <nav className="space-y-4 sticky top-4">
                        {CHAPTERS.map(chapter => (
                            <div key={chapter.id}>
                                <h3 className="font-bold text-lg mb-2">{t(chapter.titleKey)}</h3>
                                <ul className="space-y-1">
                                    {chapter.sections.map(section => (
                                    <li key={section.id}>
                                            <a 
                                                href={`#${section.id}`} 
                                                className="block text-sm p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary"
                                            >
                                                {t(section.titleKey)}
                                            </a>
                                    </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* Content */}
                <main className="md:col-span-3 h-full overflow-y-auto pr-4">
                    <ManualContent />
                </main>
            </div>
        </div>

        <AIResponseModal
            isOpen={isAiModalOpen}
            onClose={() => setIsAiModalOpen(false)}
            isLoading={isAiLoading}
            content={aiResponse}
            title={t('manual_ai_answer_title')}
        />
    </>
  );
};

export default UserManualView;