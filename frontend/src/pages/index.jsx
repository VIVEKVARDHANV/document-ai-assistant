import { useState } from 'react'
import axios from 'axios'

export default function Home() {
  const [file, setFile] = useState(null)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return
    
    const formData = new FormData()
    formData.append('file', file)

    try {
      setIsProcessing(true)
      await axios.post('/api/upload', formData)
      setMessages([...messages, { type: 'system', text: 'Document uploaded successfully! Ask me anything about it.' }])
    } catch (error) {
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleQuestion = async (e) => {
    e.preventDefault()
    if (!question.trim()) return

    setMessages([...messages, { type: 'user', text: question }])
    
    try {
      setIsProcessing(true)
      const response = await axios.post('/api/ask', { question })
      setMessages(prev => [...prev, { type: 'ai', text: response.data.answer }])
      setQuestion('')
    } catch (error) {
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Document AI Assistant</h1>
        
        {/* Upload Section */}
        <form onSubmit={handleUpload} className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <label className="block mb-4">
            <span className="text-gray-700">Upload Excel File:</span>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              accept=".xlsx"
            />
          </label>
          <button
            type="submit"
            disabled={isProcessing}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Upload Document'}
          </button>
        </form>

        {/* Chat Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-96 overflow-y-auto mb-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg ${msg.type === 'user' ? 'bg-blue-50 ml-auto w-3/4' : 'bg-gray-50 w-3/4'}`}
              >
                <p className="text-gray-800">{msg.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleQuestion} className="flex gap-4">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about the document..."
              className="flex-1 p-2 border rounded-md"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={isProcessing}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isProcessing ? 'Thinking...' : 'Ask'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}