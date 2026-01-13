#!/usr/bin/env python3
"""
Extract Q&A pairs from scraped content
Converts raw text into structured question-answer format
"""

import json
import re
import hashlib
from typing import List, Dict, Tuple
from datetime import datetime

class QAExtractor:
    def __init__(self, input_file="scraped_content.json", output_file="qa_pairs.json"):
        self.input_file = input_file
        self.output_file = output_file
        self.qa_pairs = []
        
        # Insurance-related keywords for context filtering
        self.keywords = [
            'insurance', 'coverage', 'policy', 'premium', 'claim', 'deductible',
            'liability', 'hull', 'yacht', 'boat', 'marine', 'vessel', 'protection',
            'damage', 'loss', 'risk', 'protect', 'insure', 'broker', 'underwriter'
        ]
    
    def load_scraped_content(self) -> List[Dict]:
        """Load scraped content from JSON"""
        try:
            with open(self.input_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Error: {self.input_file} not found. Run scraper.py first.")
            return []
    
    def extract_sentences(self, text: str) -> List[str]:
        """Split text into sentences"""
        # Split by common sentence endings
        sentences = re.split(r'(?<=[.!?])\s+', text)
        return [s.strip() for s in sentences if len(s.strip()) > 20 and len(s.strip()) < 500]
    
    def is_relevant(self, text: str) -> bool:
        """Check if text is relevant to yacht insurance"""
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in self.keywords)
    
    def generate_questions(self, sentence: str) -> List[str]:
        """Generate potential questions from a sentence"""
        questions = []
        
        # Pattern 1: "X is/means/refers to Y" → "What is X?"
        match = re.search(r'([\w\s]+)\s+(?:is|means|refers to|represents)\s+(.+)', sentence)
        if match:
            term = match.group(1).strip()
            if len(term.split()) <= 3:
                questions.append(f"What is {term}?")
                questions.append(f"What does {term} mean in yacht insurance?")
        
        # Pattern 2: "Yacht insurance covers/includes X" → "What does yacht insurance cover?"
        match = re.search(r'([A-Za-z\s]+)\s+(?:covers|includes|provides)\s+(.+)', sentence)
        if match:
            entity = match.group(1).strip()
            if 'insurance' in entity.lower():
                questions.append(f"What does {entity} cover?")
        
        # Pattern 3: "You should/must X" → "Should I X?"
        match = re.search(r'You\s+(?:should|must|need to)\s+(.+)', sentence)
        if match:
            action = match.group(1).strip()
            questions.append(f"Should I {action}?")
        
        # Pattern 4: "The cost/price of X is Y" → "How much does X cost?"
        match = re.search(r'(?:cost|price|expense)\s+(?:of|for)\s+([A-Za-z\s]+)\s+is\s+(.+)', sentence)
        if match:
            item = match.group(1).strip()
            questions.append(f"How much does {item} cost?")
        
        # Pattern 5: General question from keywords
        if 'deductible' in sentence.lower():
            questions.append("What is a deductible?")
        if 'premium' in sentence.lower():
            questions.append("What is an insurance premium?")
        if 'liability' in sentence.lower():
            questions.append("What is liability coverage?")
        
        return [q for q in questions if 5 <= len(q.split()) <= 15]
    
    def process_content(self) -> List[Dict]:
        """Extract Q&A from all scraped content"""
        print(f"\n📝 Processing {len(self.qa_pairs)} sources for Q&A extraction...\n")
        
        content = self.load_scraped_content()
        qa_pairs = []
        
        for source in content:
            print(f"Processing: {source['domain']}")
            
            sentences = self.extract_sentences(source['content'])
            relevant_sentences = [s for s in sentences if self.is_relevant(s)]
            
            for sentence in relevant_sentences[:20]:  # Limit per source
                questions = self.generate_questions(sentence)
                
                for question in questions:
                    # Create answer from surrounding context
                    answer = sentence.strip()
                    if answer.endswith('.'):
                        answer = answer[:-1]
                    
                    # Remove question mark and similar sentences
                    answer = answer.replace('?', '')
                    
                    qa_pair = {
                        'question': question,
                        'answer': answer[:200],  # Limit answer length
                        'source_url': source['url'],
                        'domain': source['domain'],
                        'confidence': 0.7,
                        'tags': ['coverage', 'requirements', 'definitions'],
                        'created_at': datetime.now().isoformat()
                    }
                    
                    qa_pairs.append(qa_pair)
            
            print(f"  ✓ Extracted {len(questions)} Q&A pairs")
        
        # Deduplicate by question
        seen_questions = set()
        unique_pairs = []
        for pair in qa_pairs:
            q_hash = hashlib.md5(pair['question'].lower().encode()).hexdigest()
            if q_hash not in seen_questions:
                seen_questions.add(q_hash)
                unique_pairs.append(pair)
        
        self.qa_pairs = unique_pairs
        return unique_pairs
    
    def save_to_file(self) -> None:
        """Save Q&A pairs to JSON"""
        with open(self.output_file, 'w') as f:
            json.dump(self.qa_pairs, f, indent=2)
        print(f"\n✅ Saved {len(self.qa_pairs)} unique Q&A pairs to {self.output_file}")
    
    def save_to_csv(self, csv_file="qa_import.csv") -> None:
        """Save Q&A pairs to CSV for easy import"""
        import csv
        with open(csv_file, 'w', newline='') as f:
            fieldnames = ['question', 'answer', 'source_url', 'domain', 'confidence', 'tags']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for pair in self.qa_pairs:
                # Only include fields in fieldnames
                row = {k: pair.get(k, '') for k in fieldnames}
                if isinstance(row['tags'], list):
                    row['tags'] = ';'.join(row['tags'])
                writer.writerow(row)
        print(f"✅ Saved to CSV: {csv_file}")

if __name__ == "__main__":
    extractor = QAExtractor()
    extractor.process_content()
    extractor.save_to_file()
    extractor.save_to_csv()
