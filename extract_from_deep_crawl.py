#!/usr/bin/env python3
"""
Extract Q&A from deep crawl results
"""

import json
import re
from typing import List, Dict

class DeepCrawlQAExtractor:
    def __init__(self):
        self.extracted = []
        self.duplicates = set()
    
    def extract_sentences(self, text: str) -> List[str]:
        """Split into meaningful sentences"""
        sentences = re.split(r'[.!?]+', text)
        filtered = []
        for s in sentences:
            s = s.strip()
            # Keep sentences 20-500 chars
            if 20 < len(s) < 500:
                filtered.append(s)
        return filtered
    
    def generate_questions(self, sentence: str) -> List[tuple]:
        """Generate Q&A pairs from sentences"""
        pairs = []
        
        # Pattern 1: "X is/means Y"
        match = re.search(r'(.+?)\s+(?:is|means?|refers to|defined as)\s+(.+)', sentence, re.IGNORECASE)
        if match:
            subj, defn = match.groups()
            q = f"What is {subj.strip()}?"
            pairs.append((q, sentence))
        
        # Pattern 2: "Insurance/coverage covers X"
        match = re.search(r'(Insurance|Coverage|Policy|Yacht|Boat|Marine).+?covers?(.+)', sentence, re.IGNORECASE)
        if match:
            q = "What does coverage include?"
            pairs.append((q, sentence))
        
        # Pattern 3: "You should/must X"
        match = re.search(r'(?:You should|You must|Required|Important|Essential).+', sentence, re.IGNORECASE)
        if match:
            q = "What are the requirements?"
            pairs.append((q, sentence))
        
        # Pattern 4: Numbers with keywords
        if re.search(r'\$\d+|£\d+|€\d+|\d+%', sentence):
            if any(x in sentence.lower() for x in ['cost', 'premium', 'price', 'fee', 'deductible']):
                q = "What is the cost?"
                pairs.append((q, sentence))
        
        # Pattern 5: Insurance-specific keywords
        keywords = ['liability', 'deductible', 'premium', 'claim', 'coverage', 'policy', 'insured', 'exclude', 'condition']
        for keyword in keywords:
            if keyword.lower() in sentence.lower():
                q = f"What about {keyword}?"
                pairs.append((q, sentence))
                break
        
        # Pattern 6: How/Why questions
        if sentence.startswith(('How', 'Why', 'When', 'Where', 'What')):
            q = sentence.rstrip('?') + '?'
            pairs.append((q, sentence))
        
        return pairs
    
    def process_crawl_results(self, crawl_file: str) -> List[Dict]:
        """Process deep crawl results"""
        with open(crawl_file, 'r') as f:
            results = json.load(f)
        
        qa_pairs = []
        
        for domain_result in results:
            domain = domain_result['domain']
            print(f"\n📖 Processing {domain}...")
            
            domain_qa = []
            
            for page in domain_result['pages']:
                content = page['content']
                url = page['url']
                
                sentences = self.extract_sentences(content)
                
                for sentence in sentences:
                    questions = self.generate_questions(sentence)
                    
                    for question, answer in questions:
                        # Dedup by question
                        q_hash = hash(question)
                        if q_hash not in self.duplicates:
                            self.duplicates.add(q_hash)
                            pair = {
                                'question': question,
                                'answer': answer,
                                'source_url': url,
                                'domain': domain,
                                'confidence': 0.75,
                                'tags': ['insurance', 'marine', domain.split('.')[0]]
                            }
                            qa_pairs.append(pair)
                            domain_qa.append(pair)
            
            print(f"   ✅ Extracted {len(domain_qa)} unique Q&A pairs")
        
        return qa_pairs

if __name__ == "__main__":
    extractor = DeepCrawlQAExtractor()
    qa_pairs = extractor.process_crawl_results('deep_crawl_results.json')
    
    print(f"\n{'='*60}")
    print(f"TOTAL Q&A EXTRACTED: {len(qa_pairs)}")
    print(f"{'='*60}\n")
    
    # Show samples
    print("SAMPLE Q&A PAIRS:")
    for i, pair in enumerate(qa_pairs[:10], 1):
        print(f"\n{i}. Q: {pair['question']}")
        print(f"   A: {pair['answer'][:100]}...")
    
    # Save
    with open('deep_crawl_qa.json', 'w') as f:
        json.dump(qa_pairs, f, indent=2)
    
    print(f"\n✅ Saved {len(qa_pairs)} Q&A pairs to deep_crawl_qa.json")
