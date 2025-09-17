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
                    // Start backend in background (Windows-friendly)
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
                    bat "cd /d ${env.BACKEND_DIR} && npx snyk test --severity-threshold=high --json 1>..\\${REPORT_DIR}\\backend-snyk.json || exit /b 0"
                }
            }
        }

        stage('Package Scan - Frontend') {
            steps {
                script {
                    bat "cd /d ${env.FRONTEND_DIR} && npx snyk test --severity-threshold=high --json 1>..\\${REPORT_DIR}\\frontend-snyk.json || exit /b 0"
                }
            }
        }

        stage('Generate Snyk HTML Report') {
            steps {
                script {
                    echo '📄 Generating Snyk HTML report...'
                    bat "mkdir ${REPORT_DIR} || exit 0"
                    bat """
                        npx snyk-to-html -i ${REPORT_DIR}\\backend-snyk.json -o ${REPORT_DIR}\\backend-snyk.html || exit /b 0
                    """
                    bat """
                        npx snyk-to-html -i ${REPORT_DIR}\\frontend-snyk.json -o ${REPORT_DIR}\\frontend-snyk.html || exit /b 0
                    """
                    echo '✅ Snyk HTML reports generated.'
                }
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
                echo '❌ Pipeline failed. Generating failure report...'

                // Ensure reports folder exists
                bat "mkdir ${REPORT_DIR} || exit 0"

                // Capture failed stage and build info
                def failedStage = currentBuild.rawBuild.getExecution().getCurrentHeads()[0].toString()
                def failureMessage = "Pipeline FAILED!\nFailed Stage Info: ${failedStage}\nCheck Jenkins console logs for full error details."

                writeFile file: "${REPORT_DIR}/failure-report.txt", text: failureMessage

                archiveArtifacts artifacts: "${REPORT_DIR}/failure-report.txt", allowEmptyArchive: true
            }
            // Do NOT clean workspace on failure (prevents Windows locks)
        }
        success {
            echo '✅ Pipeline completed successfully!'
            // Optional: clean workspace only on success
            cleanWs()
        }
    }
}
