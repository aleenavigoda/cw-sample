import React from "react";

interface HtmlContentProps {
  previewText?: string | null;
  fullText: string;
  isExpanded: boolean;
}

export const HtmlContent: React.FC<HtmlContentProps> = ({
  previewText,
  fullText,
  isExpanded,
}) => {
  const content = isExpanded || !previewText ? fullText : previewText;

  return (
    <div
      className="prose prose-invert prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
