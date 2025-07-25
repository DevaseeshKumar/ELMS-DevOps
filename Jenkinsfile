pipeline {
    agent any

    environment {
        DOCKER_IMAGE_NAME = 'elms-app'
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
PORT=8000
SESSION_SECRET=elms-secret-key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
EMAIL_USER=thorodinsonuru@gmail.com
EMAIL_PASS=qzerfjxnvoeupsgp
mongodburl=mongodb+srv://ELMS:ELMS@cluster0.uqtzdbr.mongodb.net/elms?retryWrites=true&w=majority
'''
            }
        }

        stage('Build & Deploy Containers') {
            steps {
                script {
                    def isWindows = isUnix() == false
                    def downCmd = 'docker compose -f docker-compose.yml down || exit 0'
                    def upCmd = 'docker compose -f docker-compose.yml up --build -d'

                    if (isWindows) {
                        bat downCmd
                        bat upCmd
                    } else {
                        sh downCmd
                        sh upCmd
                    }
                }
            }
        }

        stage('Check Container Logs (Optional)') {
            steps {
                script {
                    sh 'docker compose ps'
                    sh 'docker logs $(docker ps -qf "name=backend") || true'
                }
            }
        }
    }

    post {
        failure {
            echo '❌ Pipeline failed. Check Jenkins logs.'
            cleanWs()
        }
        success {
            echo '✅ Pipeline succeeded. Containers are up!'
        }
    }
}
