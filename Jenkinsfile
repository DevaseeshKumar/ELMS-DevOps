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
                git credentialsId: 'your-github-credentials-id', url: 'https://github.com/DevaseeshKumar/ELMS-DevOps.git', branch: 'main'
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
                    bat '.\\mvnw clean package -DskipTests'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir("${FRONTEND_DIR}") {
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }

        stage('Run Tests') {
            steps {
                dir("${BACKEND_DIR}") {
                    bat '.\\mvnw test'
                }
            }
        }

        stage('Package Scan - Backend') {
            steps {
                script {
                    bat "mkdir ${REPORT_DIR} || exit 0"
                    bat "cd /d ${env.BACKEND_DIR} && npm install"
                    bat "cd /d ${env.BACKEND_DIR} && npx snyk test --json 1>..\\${REPORT_DIR}\\backend-snyk.json || exit /b 0"
                }
            }
        }

        stage('Package Scan - Frontend') {
            steps {
                script {
                    bat "cd /d ${env.FRONTEND_DIR} && npm install"
                    bat "cd /d ${env.FRONTEND_DIR} && npx snyk test --json 1>..\\${REPORT_DIR}\\frontend-snyk.json || exit /b 0"
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

                    echo '✅ Snyk HTML report generated at reports\\backend-snyk.html and reports\\frontend-snyk.html'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                bat "docker build -t ${DOCKER_IMAGE_NAME}:latest ."
            }
        }

        stage('Push Docker Image') {
            steps {
                bat "docker tag ${DOCKER_IMAGE_NAME}:latest your-dockerhub-username/${DOCKER_IMAGE_NAME}:latest"
                bat "docker push your-dockerhub-username/${DOCKER_IMAGE_NAME}:latest"
            }
        }

        stage('Deploy Containers') {
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
                echo '🛡️ Container security scan placeholder (implement Trivy/Clair scan here)'
            }
        }
    }

    post {
        always {
            echo '📂 Archiving Snyk HTML reports...'
            archiveArtifacts artifacts: 'reports/*.html', allowEmptyArchive: true
        }
        failure {
            echo '❌ Pipeline failed. Check Jenkins logs.'
            cleanWs()
        }
        success {
            echo '✅ Pipeline completed successfully!'
        }
    }
}
