import React from 'react';

const Landing = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with Logo */}
      <header className="p-8">
        <div className="flex items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src="/logo.svg" alt="Ticki Logo" className="w-6 h-6 text-black" />
            <span className="text-black font-medium text-lg">Ticki</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 -mt-16">
        <div className="text-center max-w-4xl">
          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl font-light text-black mb-8 tracking-widest" style={{fontFamily: 'Montserrat', fontWeight: 300}}>
            AI TASK REMINDER
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-black mb-16 leading-relaxed" style={{fontFamily: 'Montserrat', fontWeight: 400}}>
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
