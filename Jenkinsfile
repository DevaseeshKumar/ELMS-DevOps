pipeline {
    agent any

    environment {
        DOCKER_IMAGE_NAME = 'elms-app'
        BACKEND_DIR = 'backend'
        FRONTEND_DIR = 'frontend'
        REPORT_DIR = 'reports'
    }

    stages {
        stage('Clone Repository') {
            steps {
                // checkout collab branch
                git credentialsId: 'your-github-credentials-id',
                    url: 'https://github.com/DevaseeshKumar/ELMS-DevOps.git',
                    branch: 'collab'
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
                    bat "npm run build || exit 0" // run build only if script exists
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
                    bat "cd /d ${env.BACKEND_DIR} && npx snyk test --severity-threshold=high --json > ..\\${REPORT_DIR}\\backend-snyk.json"
                }
            }
        }

        stage('Package Scan - Frontend') {
            steps {
                script {
                    bat "cd /d ${env.FRONTEND_DIR} && npx snyk test --severity-threshold=high --json > ..\\${REPORT_DIR}\\frontend-snyk.json"
                }
            }
        }

        stage('Generate Snyk HTML Report') {
            steps {
                script {
                    echo '📄 Generating Snyk HTML report...'

                    bat "mkdir ${REPORT_DIR} || exit 0"

                    bat "npx snyk-to-html -i ${REPORT_DIR}\\backend-snyk.json -o ${REPORT_DIR}\\backend-snyk.html"
                    bat "npx snyk-to-html -i ${REPORT_DIR}\\frontend-snyk.json -o ${REPORT_DIR}\\frontend-snyk.html"

                    echo '✅ Reports at reports\\backend-snyk.html and reports\\frontend-snyk.html'
                }
            }
        }

        stage('Build & Deploy') {
            steps {
                script {
                    bat 'docker compose -f docker-compose.yml down || exit 0'
                    bat 'docker compose -f docker-compose.yml up --build -d'
                }
            }
        }

        stage('Container Security Scan') {
            steps {
                echo '🛡️ Container security scan placeholder (add Trivy/Clair here)'
            }
        }
    }

    post {
        always {
            echo '📂 Archiving Snyk HTML reports...'
            archiveArtifacts artifacts: 'reports/*.html', allowEmptyArchive: true
        }
        failure {
            echo '❌ Pipeline failed due to errors or high vulnerabilities.'
            cleanWs()
        }
        success {
            echo '✅ Pipeline completed successfully!'
        }
    }
}
