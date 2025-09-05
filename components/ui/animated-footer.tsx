"use client"
import React, { useEffect, useRef, useState } from "react";

interface LinkItem {
  href: string;
  label: string;
}

interface FooterProps {
  leftLinks: LinkItem[];
  rightLinks: LinkItem[];
  copyrightText: string;
  barCount?: number; 
}

const Footer: React.FC<FooterProps> = ({
  leftLinks,
  rightLinks,
  copyrightText,
  barCount = 23, 
}) => {
  const waveRefs = useRef<(HTMLDivElement | null)[]>([]);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 } 
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const animateWaves = () => {
      waveRefs.current.forEach((wave, index) => {
        if (wave) {
          const time = Date.now() * 0.0005; // Slower animation
          const delay = index * 0.15;
          const height = 15 + Math.sin(time + delay) * 8; // Smaller amplitude
          wave.style.height = `${height}px`;
        }
      });
      animationFrameRef.current = requestAnimationFrame(animateWaves);
    };

    animateWaves();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible]);

  return (
    <footer
      ref={footerRef}
      className="bg-background border-t border-border relative flex flex-col w-full justify-between min-h-[200px] select-none"
    >
      <div className="container mx-auto flex flex-col md:flex-row justify-between w-full gap-4 pb-16 pt-6 px-4">
        <div className="space-y-2">
          <ul className="flex flex-wrap gap-4">
            {leftLinks.map((link, index) => (
              <li key={index}>
                <a href={link.href} className="text-sm hover:text-primary transition-colors">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="text-sm mt-4 flex items-center gap-x-1 text-muted-foreground">
            <svg className="size-3" viewBox="0 0 80 80">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                fill="currentColor"
                d="M40 80C62.0914 80 80 62.0914 80 40C80 17.9086 62.0914 0 40 0C17.9086 0 0 17.9086 0 40C0 62.0914 17.9086 80 40 80ZM40 72C57.6731 72 72 57.6731 72 40C72 22.3269 57.6731 8 40 8C22.3269 8 8 22.3269 8 40C8 57.6731 22.3269 72 40 72Z"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                fill="currentColor"
                d="M40 64C53.2548 64 64 53.2548 64 40C64 26.7452 53.2548 16 40 16C26.7452 16 16 26.7452 16 40C16 53.2548 26.7452 64 40 64ZM40 56C48.8366 56 56 48.8366 56 40C56 31.1634 48.8366 24 40 24C31.1634 24 24 31.1634 24 40C24 48.8366 31.1634 56 40 56Z"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                fill="currentColor"
                d="M40 48C44.4183 48 48 44.4183 48 40C48 35.5817 44.4183 32 40 32C35.5817 32 32 35.5817 32 40C32 44.4183 35.5817 48 40 48Z"
              />
            </svg>
            {copyrightText}
          </p>
        </div>
        <div className="space-y-2">
          <ul className="flex flex-wrap gap-4 justify-start md:justify-end">
            {rightLinks.map((link, index) => (
              <li key={index}>
                <a 
                  href={link.href} 
                  className="text-sm hover:text-primary transition-colors"
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex justify-center items-end pb-4">
        <div className="flex items-end gap-0.5 md:gap-1">
          {Array.from({ length: barCount }).map((_, index) => (
            <div
              key={index}
              ref={(el) => (waveRefs.current[index] = el)}
              className="bg-primary/60 w-0.5 md:w-1 transition-all duration-300 ease-in-out"
              style={{
                height: "15px",
                animationDelay: `${index * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
