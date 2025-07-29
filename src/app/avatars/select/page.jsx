'use client';

import { useState } from 'react';
import {
  UploadCloud,
  Download,
  Smile,
  StretchHorizontal,
  Camera,
  PaintBucket,
} from 'lucide-react';

import { expressions, expressionEmojis, selectedPoses } from '@/lib/avatar-data';
import { generateBlendShapeQuery } from '@/lib/avatar-utils';
import '@/static/avatars/avatarExpressionPicker.css';

const AVATAR_BASE_URL = "https://models.readyplayer.me/6881e12a16da7a17b7475564.png?";

const poses = ['power-stance', 'relaxed', 'standing', 'thumbs-up'];
const cameraPresets = ['portrait', 'fullbody', 'fit'];
const backgroundPresets = [
  { name: 'transparent', value: '', display: '🌀' },
  { name: 'lavender', value: '144,89,156' },
  { name: 'golden', value: '255,223,0' },
  { name: 'green', value: '106,176,76' },
  { name: 'light blue', value: '173,216,230' },
  { name: 'magenta', value: '255,0,255' },
  { name: 'sky', value: '135,206,250' },
  { name: 'orange', value: '255,165,0' },
  { name: 'rose', value: '255,102,204' },
  { name: 'aqua', value: '0,255,255' },
  { name: 'grey', value: '200,200,200' },
  { name: 'peach', value: '255,218,185' }
];

export default function AvatarExpressionPicker() {
  const [activeTab, setActiveTab] = useState('expressions');
  const [selectedExpression, setSelectedExpression] = useState('neutral');
  const [selectedPose, setSelectedPose] = useState('relaxed');
  const [selectedCamera, setSelectedCamera] = useState('portrait');
  const [selectedBackground, setSelectedBackground] = useState('');

  const expressionList = Object.keys(expressions);

  const expressionQuery = generateBlendShapeQuery(selectedExpression);
  const poseQuery = selectedPose ? `pose=${selectedPose}` : '';
  const cameraQuery = selectedCamera ? `camera=${selectedCamera}` : '';
  const bgQuery = selectedBackground ? `background=${selectedBackground}` : '';

  const queryParts = [expressionQuery, poseQuery, cameraQuery, bgQuery].filter(Boolean);
  const blendURL = AVATAR_BASE_URL + queryParts.join('&');

  return (
    <div className="avatar-picker-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="sidebar-title">Options</h2>
        <button className={`sidebar-btn ${activeTab === 'expressions' ? 'active' : ''}`} onClick={() => setActiveTab('expressions')}>
          <Smile className="sidebar-icon" /> Expressions
        </button>
        <button className={`sidebar-btn ${activeTab === 'poses' ? 'active' : ''}`} onClick={() => setActiveTab('poses')}>
          <StretchHorizontal className="sidebar-icon" /> Poses
        </button>
        <button className={`sidebar-btn ${activeTab === 'camera' ? 'active' : ''}`} onClick={() => setActiveTab('camera')}>
          <Camera className="sidebar-icon" /> Camera
        </button>
        <button className={`sidebar-btn ${activeTab === 'background' ? 'active' : ''}`} onClick={() => setActiveTab('background')}>
          <PaintBucket className="sidebar-icon" /> Background
        </button>
      </aside>

      {/* Main Avatar Display */}
      <main className="avatar-main">
        <div className="avatar-wrapper">
          <img
            key={blendURL}
            src={blendURL}
            alt={`${selectedExpression} ${selectedPose} ${selectedCamera}`}
            className="avatar-display"
          />
          <div className="avatar-actions">
            <button className="avatar-action-btn">
              <UploadCloud className="action-icon" />
              Upload your look
            </button>
            <button className="avatar-action-btn avatar-download-action-btn">
              <Download className="action-icon" />
              Download this avatar
            </button>
          </div>
        </div>
        {/* <h3 className="avatar-label">
          {expressionEmojis[selectedExpression]} {selectedExpression}
          {selectedPose && ` + ${selectedPose}`}
          {selectedCamera && ` + ${selectedCamera}`}
        </h3> */}
      </main>

      {/* Bottom Bar */}
      <footer className="avatar-footer">
        {activeTab === 'expressions' && expressionList.map((expr) => (
          <button
            key={expr}
            className={`avatar-thumb-btn ${selectedExpression === expr ? 'selected' : ''}`}
            onClick={() => setSelectedExpression(expr)}
          >
            <span className="emoji">{expressionEmojis[expr]}</span>
            <span>{expr}</span>
          </button>
        ))}

        {activeTab === 'poses' && poses.map((pose) => (
          <button
            key={pose}
            className={`avatar-thumb-btn ${selectedPose === pose ? 'selected' : ''}`}
            onClick={() => setSelectedPose(pose)}
          >
            <span className="emoji">{selectedPoses[pose]}</span>
            <span>{pose}</span>
          </button>
        ))}

        {activeTab === 'camera' && cameraPresets.map((preset) => (
          <button
            key={preset}
            className={`avatar-thumb-btn ${selectedCamera === preset ? 'selected' : ''}`}
            onClick={() => setSelectedCamera(preset)}
          >
            <span>{preset}</span>
          </button>
        ))}

        {activeTab === 'background' && backgroundPresets.map(({ name, value, display }) => (
          <button
            key={name}
            className={`avatar-color-btn ${selectedBackground === value ? 'selected' : ''}`}
            style={{ backgroundColor: value ? `rgb(${value})` : 'transparent', color: value ? '#000' : '#555' }}
            onClick={() => setSelectedBackground(value)}
          >
            {display || name}
          </button>
        ))}
      </footer>
    </div>
  );
}
