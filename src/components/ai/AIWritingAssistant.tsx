import React, { useState } from 'react';
import { Sparkles, Plus, X, Wand2, Loader2 } from 'lucide-react';
import { OpenAI } from 'openai';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface AIResponse {
  titles: Array<{
    title: string;
    points: string[];
  }>;
}

const AIWritingAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [words, setWords] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');

  const addWord = () => {
    setWords([...words, '']);
  };

  const removeWord = (index: number) => {
    if (words.length > 1) {
      setWords(words.filter((_, i) => i !== index));
    }
  };

  const updateWord = (index: number, value: string) => {
    const newWords = [...words];
    newWords[index] = value;
    setWords(newWords);
  };

  const generateSuggestions = async () => {
    
    const filteredWords = words.filter(word => word.trim() !== '');
    if (filteredWords.length === 0) {
      setError('يرجى إدخال كلمة واحدة على الأقل');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const openai = new OpenAI({
        apiKey: "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",
        dangerouslyAllowBrowser: true
      });

      const prompt = `استخدم هذه الكلمات العربية لمساعدة شخص مبتدئ في كتابة مقال أدبي باللغة العربية الفصحى واستخدام الجماليات والصور التشبيهية: ${filteredWords.join(', ')}

أعطني 3 عناوين مقترحة على أن تكون عنواين ابداعية في سياق الأدب العربي، كل عنوان مع 5 نقاط رئيسية في 5 كلمات أو أقل، فقط كبداية للمستخدمين لبدء الكتابة ويجب أن يراعى ترتيب النقاط لتكون هناك بداية ووسط ونهاية للموضوع. وكل شيء باللغة العربية.

تنسيق الإجابة:
العنوان الأول: [العنوان]
- النقطة الأولى
- النقطة الثانية
- النقطة الثالثة
- النقطة الرابعة
- النقطة الخامسة

العنوان الثاني: [العنوان]
- النقطة الأولى
- النقطة الثانية
- النقطة الثالثة
- النقطة الرابعة
- النقطة الخامسة

العنوان الثالث: [العنوان]
- النقطة الأولى
- النقطة الثانية
- النقطة الثالثة
- النقطة الرابعة
- النقطة الخامسة`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.8
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('لم يتم الحصول على استجابة من الذكاء الاصطناعي');
      }

      // Parse the response
      const parsedResponse = parseAIResponse(content);
      setResponse(parsedResponse);
    } catch (err: any) {
      console.error('Error calling OpenAI:', err);
      if (err.message?.includes('API key')) {
        setError('مفتاح API غير صحيح. يرجى التحقق من المفتاح والمحاولة مرة أخرى');
      } else if (err.message?.includes('quota')) {
        setError('تم تجاوز حد الاستخدام لمفتاح API');
      } else {
        setError('حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. يرجى المحاولة مرة أخرى');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const parseAIResponse = (content: string): AIResponse => {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const titles: Array<{ title: string; points: string[] }> = [];
    let currentTitle = '';
    let currentPoints: string[] = [];

    for (const line of lines) {
      if (line.includes('العنوان') && line.includes(':')) {
        if (currentTitle && currentPoints.length > 0) {
          titles.push({ title: currentTitle, points: currentPoints });
        }
        currentTitle = line.split(':')[1]?.trim() || '';
        currentPoints = [];
      } else if (line.trim().startsWith('-')) {
        const point = line.replace('-', '').trim();
        if (point) {
          currentPoints.push(point);
        }
      }
    }

    if (currentTitle && currentPoints.length > 0) {
      titles.push({ title: currentTitle, points: currentPoints });
    }

    return { titles };
  };

  const resetForm = () => {
    setWords(['']);
    setResponse(null);
    setError(null);
  };

  return (
    <>
      {/* Glowing AI Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative group"
        aria-label="مساعد بدء الكتابة بالذكاء الاصطناعي"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 opacity-75 group-hover:opacity-100 animate-pulse blur-sm"></div>
        <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full shadow-lg transform transition-all duration-300 group-hover:scale-110">
          <Sparkles size={20} className="text-white animate-pulse" />
        </div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 opacity-30 animate-ping"></div>
      </button>

      {/* AI Assistant Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="مساعد بدء الكتابة بالذكاء الاصطناعي"
      >
        <div className="max-h-[80vh] overflow-y-auto space-y-6 pr-2">
          {!response ? (
            <>

              {/* Words Input */}
              <div>
                <h5 className="font-bold">المساعد يولّد لك أفكارًا وعناصر لتيسير الخطوة الأولى، ولا يكتب النصوص نيابةً عنك</h5>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الكلمات المفتاحية
                </label>
                <div className="space-y-2">
                  {words.map((word, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={word}
                        onChange={(e) => updateWord(index, e.target.value)}
                        placeholder={`الكلمة ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                      {words.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWord(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addWord}
                    className="flex items-center gap-1 text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <Plus size={16} />
                    <span>إضافة كلمة</span>
                  </Button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={generateSuggestions}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white font-medium py-3 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin ml-2" />
                    <span>جاري التوليد...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={18} className="ml-2" />
                    <span>توليد الاقتراحات</span>
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              {/* AI Response Display */}
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 via-pink-100 to-red-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-red-900/30 rounded-full">
                    <Sparkles size={16} className="text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-purple-800 dark:text-purple-300">
                      اقتراحات الذكاء الاصطناعي
                    </span>
                  </div>
                </div>

                {response.titles.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-red-900/20 border border-purple-200 dark:border-purple-700"
                  >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 text-center">
                      {item.title}
                    </h3>
                    <ul className="space-y-2">
                      {item.points.map((point, pointIndex) => (
                        <li
                          key={pointIndex}
                          className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                        >
                          <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="font-medium">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                <div className="flex gap-2">
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="flex-1"
                  >
                    توليد جديد
                  </Button>
                  <Button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white"
                  >
                    إغلاق
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default AIWritingAssistant;