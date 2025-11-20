'use client'

import { motion } from 'framer-motion'
import { AuthorCard } from './AuthorCard'
import { PostActions } from './PostActions'
import { VotingButtons } from './VotingButtons'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface AnswerCardProps {
  answer: any
  index?: number
  currentUserId?: string
  isAccepted?: boolean
}

export function AnswerCard({ answer, index = 0, currentUserId, isAccepted = false }: AnswerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.08 }}
      className="relative"
    >
      {/* Accepted Answer Gold Border */}
      {isAccepted && (
        <div className="absolute -left-2 top-0 bottom-0 w-1 bg-brand-blue rounded-full" />
      )}

      <div className={`p-6 md:p-8 rounded-xl bg-gray-100  border transition-all duration-200 ${
        isAccepted
          ? 'border-brand-blue/50 shadow-lg shadow-brand-blue/10'
          : 'border-gray-200 hover:border-brand-blue/30'
      }`}>
        <div className="flex gap-6">
          {/* Voting Column */}
          <div className="shrink-0">
            <VotingButtons initialScore={answer.score || 0} postId={answer.id} />
          </div>

          {/* Content Column */}
          <div className="flex-1 min-w-0">
            {/* Answer Body */}
            <div className="prose prose-invert prose-maritime max-w-none mb-6">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="text-gray-900/80 leading-relaxed mb-4">{children}</p>,
                  h1: ({ children }) => <h1 className="text-gray-900 font-bold mb-4">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-gray-900 font-bold mb-3">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-gray-900 font-semibold mb-2">{children}</h3>,
                  ul: ({ children }) => <ul className="text-gray-900/80 list-disc pl-6 mb-4">{children}</ul>,
                  ol: ({ children }) => <ol className="text-gray-900/80 list-decimal pl-6 mb-4">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  a: ({ href, children }) => (
                    <a href={href} className="text-brand-blue hover:text-brand-blue-light underline">
                      {children}
                    </a>
                  ),
                  code: ({ children }) => (
                    <code className="px-2 py-1 rounded bg-white-light text-brand-blue text-sm">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="p-4 rounded-lg bg-white-light border border-brand-blue/20 overflow-x-auto mb-4">
                      {children}
                    </pre>
                  ),
                }}
              >
                {answer.body}
              </ReactMarkdown>
            </div>

            {/* Actions & Author Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-gray-200">
              {/* Actions */}
              <PostActions
                postId={answer.id}
                authorId={answer.author_id}
                currentUserId={currentUserId}
              />

              {/* Author Card */}
              <div className="md:w-80">
                <AuthorCard
                  author={answer.author}
                  timestamp={answer.created_at}
                  label="answered"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
