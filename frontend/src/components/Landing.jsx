import React from 'react';

const Landing = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-white relative">
      {/* Header with Logo */}
      <header className="absolute top-0 left-0 p-8 z-10">
        <div className="flex items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src="/logo.svg" alt="Ticki Logo" className="w-6 h-6 text-black" />
            <span className="text-black font-medium text-lg">Ticki</span>
          </div>
        </div>
      </header>

      {/* Main Content - Perfectly Centered */}
      <main className="min-h-screen flex flex-col items-center justify-center px-8">
        <div className="text-center flex flex-col items-center justify-center">
          {/* Main Title */}
          <h1 className="text-black mb-8 tracking-widest whitespace-nowrap" style={{fontFamily: 'Montserrat', fontWeight: 200, fontSize: '30px'}}>
            AI TASK REMINDER
          </h1>

          {/* Subtitle */}
          <p className="text-black mb-16 leading-relaxed whitespace-nowrap" style={{fontFamily: 'Montserrat', fontWeight: 400, fontSize: '30px'}}>
            Add A Task. Let AI Prioritize It. Get Smart Reminders.
          </p>

          {/* CTA Button */}
          <button
            onClick={onStart}
            className="px-12 py-4 border-2 border-black text-black font-medium text-lg rounded-full hover:bg-black hover:text-white transition-all duration-300 tracking-wide"
          >
            LET'S START
          </button>
        </div>
      </main>
    </div>
  );
};

export default Landing;
