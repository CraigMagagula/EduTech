
import React from 'react';

interface ContentDisplayProps {
  content: string;
}

const ContentDisplay: React.FC<ContentDisplayProps> = ({ content }) => {
  if (!content) return null;

  // Regex to find URLs (simplified for this context)
  // It looks for http(s)://, www. or domain.tld patterns
  const urlRegex = /(\b(?:https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\bwww\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\b[-A-Z0-9+&@#\/%?=~_|!:,.;]+\.[A-Z]{2,}\b)/ig;

  const parts = content.split(urlRegex).filter(part => part !== undefined);

  return (
    <div className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
      {parts.map((part, index) => {
        if (urlRegex.test(part)) {
          // Ensure the URL has a protocol for the anchor tag's href
          let href = part;
          if (!part.startsWith('http://') && !part.startsWith('https://') && !part.startsWith('ftp://')) {
            // Check if it's a www. link, if so, common to prepend http
            if (part.startsWith('www.')) {
                href = `http://${part}`;
            } else {
                // For other domain-like patterns, also try http as a default.
                // This is a simplification; robust URL protocol handling is complex.
                href = `http://${part}`;
            }
          }
          return (
            <a
              key={index}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 hover:text-sky-800 underline break-all"
            >
              {part}
            </a>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </div>
  );
};

export default ContentDisplay;
