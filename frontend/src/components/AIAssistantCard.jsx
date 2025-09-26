import { useState, useEffect } from 'react';
import axios from 'axios';

const AIAssistantCard = ({ taskData }) => {
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const getAiAnalysis = async () => {
      // Only analyze if we have both description and due date
      if (taskData.description?.trim() && taskData.dueDate) {
        setIsLoading(true);
        setShowContent(true);
        
        try {
          const response = await axios.post('/prioritize', {
            title: taskData.title || '',
            description: taskData.description,
            dueDate: taskData.dueDate,
            category: taskData.category || ''
          });
          
          setAiAnalysis(response.data);
        } catch (error) {
          console.error('AI analysis error:', error);
          setAiAnalysis({
            analysis: "I'm having trouble analyzing this task right now, but it looks important!",
            suggestion: {
              priority: 'medium',
              reminder: '1 hour before',
              suggestedCategory: 'other'
            }
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setShowContent(false);
        setAiAnalysis(null);
      }
    };

    // Debounce the AI call by 1 second
    const timeoutId = setTimeout(getAiAnalysis, 1000);
    return () => clearTimeout(timeoutId);
  }, [taskData.description, taskData.dueDate, taskData.title, taskData.category]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200" style={{ borderWidth: '0.5px' }}>
      {/* Card Header */}
      <h3 className="text-lg font-medium text-black mb-6" style={{ fontFamily: 'Montserrat' }}>
        Ticki AI
      </h3>

      {/* AI Content */}
      <div className={`transition-all duration-300 ease-in-out ${showContent ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-2'}`}>
        {!showContent ? (
          /* Initial State */
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🤖</div>
            <p className="text-gray-600" style={{ fontFamily: 'Montserrat' }}>
              AI Assistant - Start typing to get analysis
            </p>
          </div>
        ) : isLoading ? (
          /* Loading State */
          <div className="text-center py-12">
            <div className="text-4xl mb-4 animate-pulse">🤔</div>
            <p className="text-gray-600" style={{ fontFamily: 'Montserrat' }}>
              AI is analyzing...
            </p>
            <div className="mt-4">
              <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          </div>
        ) : aiAnalysis ? (
          /* AI Analysis Results */
          <div className="space-y-4 animate-fade-in">
            {/* AI Analysis */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2" style={{ fontFamily: 'Montserrat' }}>
                🤖 AI Analysis:
              </h4>
              <p className="text-blue-800 text-sm leading-relaxed" style={{ fontFamily: 'Montserrat' }}>
                {aiAnalysis.analysis}
              </p>
            </div>

            {/* AI Suggestions */}
            {aiAnalysis.suggestion && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3" style={{ fontFamily: 'Montserrat' }}>
                  💡 Suggestions:
                </h4>
                <div className="space-y-2 text-sm" style={{ fontFamily: 'Montserrat' }}>
                  {aiAnalysis.suggestion.priority && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        aiAnalysis.suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                        aiAnalysis.suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {aiAnalysis.suggestion.priority}
                      </span>
                    </div>
                  )}
                  
                  {aiAnalysis.suggestion.reminder && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Reminder:</span>
                      <span className="text-gray-900 font-medium">
                        {aiAnalysis.suggestion.reminder}
                      </span>
                    </div>
                  )}
                  
                  {aiAnalysis.suggestion.suggestedCategory && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="text-gray-900 font-medium">
                        {aiAnalysis.suggestion.suggestedCategory}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Encouraging Message */}
            <div className="text-center pt-4">
              <p className="text-gray-500 text-sm" style={{ fontFamily: 'Montserrat' }}>
                ✨ Ready to help you stay organized!
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AIAssistantCard;
