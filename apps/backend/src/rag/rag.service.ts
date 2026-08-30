import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { randomUUID } from 'crypto';

interface Document {
  id: string;
  content: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

interface SearchResult {
  query: string;
  answer: string;
  sources: Document[];
  tokensUsed: number;
  timestamp: string;
}

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private documents: Document[] = [];
  private readonly claudeApiKey = process.env.CLAUDE_API_KEY;

  async ingestDocuments(
    docs: Array<{ content: string; metadata?: Record<string, any> }>,
  ): Promise<{ count: number; total: number }> {
    try {
      const withIds = docs.map(doc => ({
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        ...doc,
      }));
      this.documents.push(...withIds);
      this.logger.log(`Ingested ${docs.length} documents. Total: ${this.documents.length}`);
      return { count: docs.length, total: this.documents.length };
    } catch (error) {
      this.logger.error('Error ingesting documents:', error);
      throw error;
    }
  }

  async createDocument(doc: { content: string; metadata?: Record<string, any> }): Promise<Document> {
    const created: Document = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...doc,
    };
    this.documents.push(created);
    this.logger.log(`Created document ${created.id}. Total: ${this.documents.length}`);
    return created;
  }

  async getDocumentById(id: string): Promise<Document | undefined> {
    return this.documents.find(doc => doc.id === id);
  }

  async getLatestDocuments(limit: number = 20): Promise<Document[]> {
    return [...this.documents]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async search(query: string): Promise<SearchResult> {
    try {
      if (!query || query.trim().length === 0) {
        throw new Error('Query cannot be empty');
      }

      const relevantDocs = this.findRelevantDocuments(query, 5);
      const answer = await this.generateAnswerWithClaude(query, relevantDocs);

      return {
        query,
        answer,
        sources: relevantDocs,
        tokensUsed: 0,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Search error:', error);
      throw error;
    }
  }

  async semanticSearch(query: string, topK: number = 10): Promise<Document[]> {
    try {
      return this.findRelevantDocuments(query, topK);
    } catch (error) {
      this.logger.error('Semantic search error:', error);
      throw error;
    }
  }

  async getStats(): Promise<{ totalDocuments: number; ready: boolean }> {
    return {
      totalDocuments: this.documents.length,
      ready: this.documents.length > 0,
    };
  }

  private findRelevantDocuments(query: string, limit: number): Document[] {
    const queryLower = query.toLowerCase();
    const scored = this.documents.map((doc, idx) => {
      const content = doc.content?.toLowerCase() || '';
      const title = doc.metadata?.title?.toLowerCase() || '';
      
      let score = 0;
      const queryTerms = queryLower.split(/\s+/).filter(t => t.length > 0);
      
      for (const term of queryTerms) {
        if (content.includes(term)) score += 2;
        if (title.includes(term)) score += 3;
      }
      
      return { doc, score, idx };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.doc);
  }

  private async generateAnswerWithClaude(query: string, sources: Document[]): Promise<string> {
    try {
      if (!this.claudeApiKey) {
        return this.generateFallbackAnswer(query, sources);
      }

      const context = sources
        .map((doc, i) => `[Source ${i + 1}]: ${doc.content}`)
        .join('\n\n');

      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: `Based on these sources:\n\n${context}\n\nAnswer this query: ${query}\n\nProvide a concise answer based on the sources.`,
            },
          ],
        },
        {
          headers: {
            'x-api-key': this.claudeApiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
        },
      );

      const content = response.data.content[0];
      if (content.type === 'text') {
        return content.text;
      }

      return this.generateFallbackAnswer(query, sources);
    } catch (error) {
      this.logger.warn('Claude API error, using fallback:', error);
      return this.generateFallbackAnswer(query, sources);
    }
  }

  private generateFallbackAnswer(query: string, sources: Document[]): string {
    if (sources.length === 0) {
      return `No relevant sources found for query: "${query}"`;
    }

    const summary = sources
      .slice(0, 2)
      .map(doc => `- ${doc.metadata?.title || 'Untitled'}: ${doc.content.substring(0, 100)}...`)
      .join('\n');

    return `Based on available sources related to "${query}":\n\n${summary}`;
  }
}
