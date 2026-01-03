import React, { useState } from 'react';
import './FAQ.css';

interface FAQItem {
  question: string;
  answer: string;
  link?: {
    text: string;
    url: string;
  };
}

const faqData: FAQItem[] = [
  {
    question: "What data format does EngineCore accept?",
    answer: "EngineCore accepts NASA C-MAPSS formatted data, which includes 21 sensor measurements and 3 operational settings per engine cycle. Data should be in CSV format with headers.",
    link: {
      text: "View Data Schema",
      url: "#"
    }
  },
  {
    question: "How accurate are the RUL predictions?",
    answer: "Our LSTM-based models achieve an average accuracy of 92% on the NASA C-MAPSS benchmark dataset. Accuracy varies based on the quality and completeness of your input data.",
    link: {
      text: "See Benchmark Results",
      url: "#"
    }
  },
  {
    question: "Can I use EngineCore for other types of engines?",
    answer: "Currently, EngineCore is optimized for turbofan engines based on the C-MAPSS dataset. We're working on expanding support to other engine types including wind turbines and industrial motors.",
  },
  {
    question: "How do I interpret the Health Score results?",
    answer: "Health scores range from 0-100% for each component. Scores above 80% indicate healthy operation, 50-80% suggest monitoring is needed, and below 50% indicates potential failure risk.",
    link: {
      text: "Health Score Guide",
      url: "#"
    }
  },
  {
    question: "Is my data stored on your servers?",
    answer: "No, your data is processed in real-time and is not stored permanently. Each analysis session creates a temporary worker that processes your data and terminates after completion.",
  },
  {
    question: "How can I create my own dataset?",
    answer: "You can collect sensor data from your engines using standard IoT sensors. Ensure you capture the 21 sensor measurements defined in the C-MAPSS schema. We provide a data validation tool to verify your format.",
    link: {
      text: "Dataset Creation Guide",
      url: "#"
    }
  }
];

const FAQ: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section id="help" className="section faq-section">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">Got Questions?</span>
          <h2 className="section-title">Help Center</h2>
          <p className="section-description">
            Find answers to common questions about EngineCore and predictive maintenance.
          </p>
        </div>

        <div className="faq-grid">
          <div className="faq-list">
            {faqData.map((item, index) => (
              <div 
                key={index}
                className={`accordion-item animate-fade-in-up ${activeIndex === index ? 'active' : ''}`}
                style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
              >
                <button 
                  className="accordion-header"
                  onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                >
                  <span className="question-number">0{index + 1}</span>
                  <span className="question-text">{item.question}</span>
                  <span className="accordion-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </span>
                </button>
                <div className="accordion-body">
                  <div className="accordion-content">
                    <p>{item.answer}</p>
                    {item.link && (
                      <a href={item.link.url} className="faq-link">
                        {item.link.text}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="faq-support animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
            <div className="support-card">
              <div className="support-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </div>
              <h3>Still need help?</h3>
              <p>Our team is available to assist with technical questions and custom implementations.</p>
              <button className="btn btn-secondary">
                Contact Support
              </button>
            </div>

            <div className="support-card">
              <div className="support-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
              </div>
              <h3>Open Source</h3>
              <p>View the source code, contribute, or report issues on our GitHub repository.</p>
              <a href="https://github.com/EroKami-727/engine-care" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
