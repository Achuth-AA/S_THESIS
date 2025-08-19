import React, { useState, useEffect } from 'react'
import { Upload, FileText, Send, Database, AlertCircle, CheckCircle, XCircle, Download, Trash2 } from 'lucide-react'
import { API_ENDPOINTS } from '../config/api'

const Prediction = () => {
  const [inputMode, setInputMode] = useState('manual')
  const [formData, setFormData] = useState({})
  const [csvFile, setCsvFile] = useState(null)
  const [predictions, setPredictions] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Key features for manual input (selecting important ones for UI)
  const featureGroups = {
    'Flow Features': [
      { name: 'flow_duration', label: 'Flow Duration', placeholder: 'e.g., 0.5' },
      { name: 'flow_bytes_s', label: 'Flow Bytes/s', placeholder: 'e.g., 1024' },
      { name: 'flow_packets_s', label: 'Flow Packets/s', placeholder: 'e.g., 100' },
    ],
    'Packet Features': [
      { name: 'total_fwd_packets', label: 'Total Fwd Packets', placeholder: 'e.g., 10' },
      { name: 'total_bwd_packets', label: 'Total Bwd Packets', placeholder: 'e.g., 8' },
      { name: 'packet_length_mean', label: 'Packet Length Mean', placeholder: 'e.g., 512' },
    ],
    'Flag Features': [
      { name: 'syn_flag_count', label: 'SYN Flag Count', placeholder: 'e.g., 1' },
      { name: 'ack_flag_count', label: 'ACK Flag Count', placeholder: 'e.g., 1' },
      { name: 'psh_flag_count', label: 'PSH Flag Count', placeholder: 'e.g., 0' },
    ],
  }

  const attackTypes = {
    0: { name: 'BENIGN', color: 'green' },
    1: { name: 'Bot', color: 'orange' },
    2: { name: 'DDoS', color: 'red' },
    3: { name: 'DoS GoldenEye', color: 'red' },
    4: { name: 'DoS Hulk', color: 'red' },
    5: { name: 'DoS Slowhttptest', color: 'red' },
    6: { name: 'DoS Slowloris', color: 'red' },
    7: { name: 'FTP-Patator', color: 'orange' },
    8: { name: 'Heartbleed', color: 'purple' },
    9: { name: 'Infiltration', color: 'purple' },
    10: { name: 'PortScan', color: 'yellow' },
    11: { name: 'SSH-Patator', color: 'orange' },
    12: { name: 'Web Attack - Brute Force', color: 'red' },
    13: { name: 'Web Attack - SQL Injection', color: 'red' },
    14: { name: 'Web Attack - XSS', color: 'red' },
  }

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type === 'text/csv') {
      setCsvFile(file)
    }
  }

  const handleManualPredict = async () => {
    setIsLoading(true)
    try {
      // Prepare the data for API call
      const apiData = {}
      
      // Map form data to API expected format
      Object.entries(featureGroups).forEach(([groupName, features]) => {
        features.forEach(feature => {
          const value = formData[feature.name]
          if (value !== undefined && value !== '') {
            // Map to actual API field names
            const apiFieldName = feature.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            apiData[apiFieldName] = parseFloat(value) || 0
          }
        })
      })
      
      // Fill missing fields with default values
      const defaultFields = {
        'Destination Port': 0,
        'Flow Duration': apiData['Flow Duration'] || 0,
        'Total Fwd Packets': apiData['Total Fwd Packets'] || 0,
        'Total Backward Packets': apiData['Total Bwd Packets'] || 0,
        'Flow Bytes/s': apiData['Flow Bytes S'] || 0,
        'Flow Packets/s': apiData['Flow Packets S'] || 0,
        'Packet Length Mean': apiData['Packet Length Mean'] || 0,
        'SYN Flag Count': apiData['Syn Flag Count'] || 0,
        'ACK Flag Count': apiData['Ack Flag Count'] || 0,
        'PSH Flag Count': apiData['Psh Flag Count'] || 0
      }
      
      // Merge with defaults
      const finalData = { ...defaultFields, ...apiData }
      
      const response = await fetch(API_ENDPOINTS.PREDICT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      setPredictions([{
        id: Date.now(),
        type: 'Manual Entry',
        result: result.attack_type,
        confidence: result.confidence,
        label: result.label,
        timestamp: new Date().toLocaleTimeString()
      }])
      
    } catch (error) {
      console.error('Prediction error:', error)
      alert('Error making prediction. Please check if the server is running.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCsvPredict = async () => {
    if (!csvFile) return
    setIsLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', csvFile)
      
      const response = await fetch(API_ENDPOINTS.PREDICT_CSV, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      const predictions = result.results.map(item => ({
        id: Date.now() + item.row,
        row: item.row,
        result: item.attack_type,
        confidence: item.confidence,
        label: item.label,
      }))
      
      setPredictions(predictions)
      
    } catch (error) {
      console.error('CSV prediction error:', error)
      alert('Error processing CSV file. Please check if the server is running and the CSV format is correct.')
    } finally {
      setIsLoading(false)
    }
  }

  const getAttackColor = (label) => {
    const colors = {
      green: 'text-green-400 bg-green-400/10 border-green-400/20',
      yellow: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
      orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
      red: 'text-red-400 bg-red-400/10 border-red-400/20',
      purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    }
    return colors[attackTypes[label]?.color] || colors.green
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          Network Traffic Prediction
        </h2>
        <p className="text-gray-400">Analyze network traffic patterns using AI-powered detection</p>
      </div>

      {/* Input Mode Toggle */}
      <div className="flex justify-center">
        <div className="bg-black/40 backdrop-blur-lg rounded-xl p-1 border border-purple-500/20">
          <div className="flex space-x-1">
            <button
              onClick={() => setInputMode('manual')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                inputMode === 'manual'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Manual Entry</span>
            </button>
            <button
              onClick={() => setInputMode('csv')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                inputMode === 'csv'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>CSV Upload</span>
            </button>
          </div>
        </div>
      </div>

      {/* Input Section */}
      {inputMode === 'manual' ? (
        <div className="bg-black/40 backdrop-blur-lg rounded-xl p-8 border border-purple-500/20">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Database className="w-5 h-5 mr-2 text-purple-400" />
            Enter Network Features
          </h3>
          
          <div className="space-y-6">
            {Object.entries(featureGroups).map(([groupName, features]) => (
              <div key={groupName}>
                <h4 className="text-sm font-medium text-purple-400 mb-3">{groupName}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {features.map((feature) => (
                    <div key={feature.name}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {feature.label}
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder={feature.placeholder}
                        onChange={(e) => handleInputChange(feature.name, e.target.value)}
                        className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleManualPredict}
            disabled={isLoading}
            className="mt-6 w-full bg-white text-black py-4 rounded-lg font-semibold hover:shadow-lg hover:shadow-white/25 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Predict Attack Type</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="bg-black/40 backdrop-blur-lg rounded-xl p-8 border border-purple-500/20">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Upload className="w-5 h-5 mr-2 text-purple-400" />
            Upload CSV File
          </h3>

          <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-12 text-center hover:border-purple-400/50 transition-all duration-300">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <Upload className="w-16 h-16 mx-auto text-purple-400 mb-4" />
              <p className="text-white font-medium mb-2">
                {csvFile ? csvFile.name : 'Click to upload or drag and drop'}
              </p>
              <p className="text-gray-400 text-sm">CSV files only (max 10MB)</p>
            </label>
          </div>

          {csvFile && (
            <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white font-medium">{csvFile.name}</p>
                    <p className="text-gray-400 text-sm">
                      {(csvFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCsvFile(null)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleCsvPredict}
            disabled={!csvFile || isLoading}
            className="mt-6 w-full bg-white text-black py-4 rounded-lg font-semibold hover:shadow-lg hover:shadow-white/25 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing CSV...</span>
              </>
            ) : (
              <>
                <Database className="w-5 h-5" />
                <span>Analyze CSV Data</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Results Section */}
      {predictions.length > 0 && (
        <div className="bg-black/40 backdrop-blur-lg rounded-xl p-8 border border-purple-500/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-purple-400" />
              Prediction Results
            </h3>
            <button className="text-purple-400 hover:text-purple-300 transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span className="text-sm">Export</span>
            </button>
          </div>

          {inputMode === 'manual' ? (
            predictions.map((pred) => (
              <div key={pred.id} className="bg-white/5 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {pred.label === 0 ? (
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-400" />
                    )}
                    <div>
                      <p className="text-white font-semibold text-lg">{pred.result}</p>
                      <p className="text-gray-400 text-sm">Confidence: {pred.confidence}%</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getAttackColor(pred.label)}`}>
                    {pred.label === 0 ? 'Safe' : 'Threat'}
                  </span>
                </div>
                <div className="text-gray-400 text-sm">
                  Analyzed at {pred.timestamp}
                </div>
              </div>
            ))
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/20">
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Row</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Classification</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Confidence</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((pred) => (
                    <tr key={pred.id} className="border-b border-purple-500/10 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 text-white">{pred.row}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getAttackColor(pred.label)}`}>
                          {pred.result}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-300">{pred.confidence}%</td>
                      <td className="py-4 px-4">
                        {pred.label === 0 ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Prediction