pipeline {
    agent any

    environment {
        DOCKER_IMAGE_NAME = 'elms-app'
        BACKEND_DIR = 'backend'
        FRONTEND_DIR = 'frontend'
        REPORT_DIR = 'reports'
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'collab',
                    credentialsId: 'your-github-credentials-id',
                    url: 'https://github.com/DevaseeshKumar/ELMS-DevOps.git'
            }
        }

        stage('Write .env') {
            steps {
                writeFile file: '.env', text: '''\
mongodburl=mongodb+srv://ELMS:ELMS@cluster0.uqtzdbr.mongodb.net/elms?retryWrites=true&w=majority&appName=Cluster0
PORT=8000
EMAIL_USER=thorodinsonuru@gmail.com
EMAIL_PASS=qzerfjxnvoeupsgp
FRONTEND_URL=https://localhost:5173
SESSION_SECRET=elms-secret-key
NODE_ENV=production
'''
            }
        }

        stage('Build Backend') {
            steps {
                dir("${BACKEND_DIR}") {
                    bat "npm install"
                    echo "⚡ Starting backend with nodemon..."
                    bat "start /B npx nodemon server.js"
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir("${FRONTEND_DIR}") {
                    bat "npm install"
                    bat "npm run build"
                }
            }
        }

        stage('Package Scan - Backend') {
            steps {
                script {
                    bat "mkdir ${REPORT_DIR} || exit 0"

                    // Run Snyk test and save JSON output
                    bat """
                    cd /d ${BACKEND_DIR} && npx snyk test --severity-threshold=high --json 1>..\\${REPORT_DIR}\\backend-snyk.json
                    """

                    // Read the JSON to check for high vulnerabilities
                    def backendJson = readFile("${REPORT_DIR}/backend-snyk.json")
                    def backendData = readJSON text: backendJson

                    if (backendData.vulnerabilities?.any { it.severity == 'high' || it.severity == 'critical' }) {
                        error "🚨 Backend has high or critical vulnerabilities. Failing pipeline."
                    }
                }
            }
        }

        stage('Package Scan - Frontend') {
            steps {
                script {
                    bat """
                    cd /d ${FRONTEND_DIR} && npx snyk test --severity-threshold=high --json 1>..\\${REPORT_DIR}\\frontend-snyk.json
                    """

                    def frontendJson = readFile("${REPORT_DIR}/frontend-snyk.json")
                    def frontendData = readJSON text: frontendJson

                    if (frontendData.vulnerabilities?.any { it.severity == 'high' || it.severity == 'critical' }) {
                        error "🚨 Frontend has high or critical vulnerabilities. Failing pipeline."
                    }
                }
            }
        }

        stage('Generate Snyk HTML Report') {
            steps {
                echo '📄 Generating Snyk HTML reports...'
                bat "mkdir ${REPORT_DIR} || exit 0"
                bat "npx snyk-to-html -i ${REPORT_DIR}\\backend-snyk.json -o ${REPORT_DIR}\\backend-snyk.html"
                bat "npx snyk-to-html -i ${REPORT_DIR}\\frontend-snyk.json -o ${REPORT_DIR}\\frontend-snyk.html"
            }
        }

        stage('Build & Deploy Containers') {
            steps {
                script {
                    def downCmd = 'docker compose -f docker-compose.yml down || exit 0'
                    def upCmd = 'docker compose -f docker-compose.yml up --build -d'

                    bat downCmd
                    bat upCmd
                }
            }
        }

        stage('Container Security Scan') {
            steps {
                echo '🛡️ Container security scan placeholder (implement Trivy/Clair here)'
            }
        }
    }

    post {
        always {
            echo '📂 Archiving Snyk HTML reports...'
            archiveArtifacts artifacts: 'reports/*.html', allowEmptyArchive: true
        }
        failure {
            script {
                echo '❌ Pipeline failed. Saving failure logs...'
                
                def logs = currentBuild.rawBuild.getLog(1000).join('\n')
                writeFile file: "${REPORT_DIR}/failure-report.txt", text: logs
                archiveArtifacts artifacts: "${REPORT_DIR}/failure-report.txt", allowEmptyArchive: true
            }
            cleanWs()
        }
        success {
            echo '✅ Pipeline completed successfully!'
        }
    }
}
