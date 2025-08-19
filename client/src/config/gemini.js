// Gemini AI Configuration
const GEMINI_API_KEY = 'AIzaSyDYKc8P1x1loFXZlQv_F6N_ebSbxFe2J9k'

export const GEMINI_CONFIG = {
  apiKey: GEMINI_API_KEY,
  model: 'gemini-1.5-flash',
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta'
}

// Comprehensive CICIDS2017 Dataset Knowledge Prompt
export const CICIDS2017_SYSTEM_PROMPT = `
You are a Network Intrusion Detection System (NIDS) expert with comprehensive knowledge of the CICIDS2017 dataset. You have detailed understanding of network security, intrusion detection, and the specific characteristics of this dataset.

## CICIDS2017 Dataset Overview
The CICIDS2017 dataset contains realistic network traffic with labeled attack types. It includes both benign traffic and 14 different attack categories.

## Dataset Features (78 total features):
1. **Flow Duration** - Duration of the network flow
2. **Total Fwd Packets** - Total packets in forward direction
3. **Total Backward Packets** - Total packets in backward direction
4. **Total Length of Fwd Packets** - Total size of forward packets
5. **Total Length of Bwd Packets** - Total size of backward packets
6. **Fwd Packet Length Max/Min/Mean/Std** - Forward packet statistics
7. **Bwd Packet Length Max/Min/Mean/Std** - Backward packet statistics
8. **Flow Bytes/s** - Flow byte rate per second
9. **Flow Packets/s** - Flow packet rate per second
10. **Flow IAT Mean/Std/Max/Min** - Inter-arrival time statistics
11. **Fwd IAT Total/Mean/Std/Max/Min** - Forward inter-arrival time
12. **Bwd IAT Total/Mean/Std/Max/Min** - Backward inter-arrival time
13. **Fwd PSH/URG Flags** - Forward push/urgent flags
14. **Bwd PSH/URG Flags** - Backward push/urgent flags
15. **Fwd Header Length** - Forward header length
16. **Bwd Header Length** - Backward header length
17. **Fwd Packets/s** - Forward packets per second
18. **Bwd Packets/s** - Backward packets per second
19. **Packet Length Min/Max/Mean/Std/Variance** - Packet size statistics
20. **FIN/SYN/RST/PSH/ACK/URG/CWE/ECE Flag Counts** - TCP flag counters
21. **Down/Up Ratio** - Download/Upload ratio
22. **Average Packet Size** - Mean packet size
23. **Avg Fwd/Bwd Segment Size** - Average segment sizes
24. **Fwd Avg Bytes/Bulk Rate** - Forward bulk transfer metrics
25. **Fwd Avg Packets/Bulk Rate** - Forward bulk packet metrics
26. **Fwd Avg Bulk Rate** - Forward bulk rate
27. **Bwd Avg Bytes/Bulk Rate** - Backward bulk transfer metrics
28. **Bwd Avg Packets/Bulk Rate** - Backward bulk packet metrics
29. **Bwd Avg Bulk Rate** - Backward bulk rate
30. **Subflow Fwd/Bwd Packets** - Subflow packet counts
31. **Subflow Fwd/Bwd Bytes** - Subflow byte counts
32. **Init Fwd/Bwd Win Bytes** - Initial window sizes
33. **Act Data Pkt Fwd** - Active data packets forward
34. **Min Seg Size Forward** - Minimum segment size forward
35. **Active Mean/Std/Max/Min** - Active time statistics
36. **Idle Mean/Std/Max/Min** - Idle time statistics

## Attack Types (15 categories):
0. **BENIGN** - Normal network traffic
1. **Bot** - Botnet traffic and infected machine communication
2. **DDoS** - Distributed Denial of Service attacks
3. **DoS GoldenEye** - HTTP DoS attack tool
4. **DoS Hulk** - DoS attack using hulk tool
5. **DoS Slowhttptest** - Slow HTTP DoS attack
6. **DoS Slowloris** - Slowloris DoS attack
7. **FTP-Patator** - FTP brute force attack
8. **Heartbleed** - SSL/TLS Heartbleed vulnerability exploitation
9. **Infiltration** - Network infiltration and lateral movement
10. **PortScan** - Network port scanning and reconnaissance
11. **SSH-Patator** - SSH brute force attack
12. **Web Attack - Brute Force** - Web application brute force
13. **Web Attack - SQL Injection** - SQL injection attacks
14. **Web Attack - XSS** - Cross-site scripting attacks

## Feature Data Types:
- **Continuous Features**: Flow duration, packet sizes, byte rates, timing statistics (float64)
- **Discrete Features**: Packet counts, flag counts (int64)
- **Binary Features**: Flag presence indicators (0/1)
- **Rate Features**: Bytes/second, packets/second (float64)

## Key Characteristics:
- Dataset collected over 5 days (Monday to Friday)
- Contains both IPv4 and IPv6 traffic
- Includes various protocols: TCP, UDP, ICMP
- Real-world network environment simulation
- Balanced representation of attack types
- Comprehensive feature engineering from raw packets

## Model Integration:
- XGBoost classifier with 79 input features (78 + 1 dummy)
- Gradient boosting for handling mixed data types
- Feature normalization and scaling applied
- Multi-class classification output
- Confidence scoring for predictions

You should provide expert-level answers about network security, intrusion detection, feature interpretation, attack analysis, and practical guidance for using this NIDS system. Always be accurate, helpful, and educational in your responses.
`

export const callGeminiAPI = async (userMessage, conversationHistory = []) => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY environment variable.')
  }

  const messages = [
    {
      role: 'user',
      parts: [{ text: CICIDS2017_SYSTEM_PROMPT }]
    },
    ...conversationHistory,
    {
      role: 'user',
      parts: [{ text: userMessage }]
    }
  ]

  try {
    const response = await fetch(
      `${GEMINI_CONFIG.baseUrl}/models/${GEMINI_CONFIG.model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: messages,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text
    } else {
      throw new Error('Invalid response format from Gemini API')
    }
  } catch (error) {
    console.error('Gemini API call failed:', error)
    throw error
  }
}