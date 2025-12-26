const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDirs = [
    'uploads/',
    'uploads/projects/',
    'uploads/profiles/',
    'uploads/documents/',
    'uploads/images/'
];

uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(` Created directory: ${dir}`);
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/';
        
        if (req.baseUrl.includes('/project')) {
            uploadPath = 'uploads/projects/';
        } else if (req.baseUrl.includes('/user') || req.baseUrl.includes('/profile')) {
            uploadPath = 'uploads/profiles/';
        } else if (file.mimetype.startsWith('image/')) {
            uploadPath = 'uploads/images/';
        } else {
            uploadPath = 'uploads/documents/';
        }
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-');
        
        cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|xls|xlsx|ppt|pptx|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.source}`));
    }
};

const upload = multer({
    storage: storage,
    limits: { 
        fileSize: 10 * 1024 * 1024, 
        files: 5 
    },
    fileFilter: fileFilter
});

const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 10MB.'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum is 5 files per upload.'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected field name in file upload.'
            });
        }
    }
    
    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message || 'File upload failed.'
        });
    }
    
    next();
};

module.exports = upload;
module.exports.handleMulterError = handleMulterError;