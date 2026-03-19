import React, { useState } from 'react';
import { FiCode, FiChevronRight } from 'react-icons/fi';
import './AdminPages.css';
import './ComponentsExample.css';

// Import all component examples
// To add a new component example:
// 1. Create a *.example.js file in your component folder
// 2. Export example functions from that file
// 3. Import it here and add it to componentSections array below

// Button Examples
import * as ButtonExamples from '../../components/Button/Button.example';

// Modal Examples
import * as ModalExamples from '../../components/Modal/Modal.example';

// TextBox Examples
import * as TextBoxExamples from '../../components/TextBox/TextBox.example';

// CountrySelect Examples
import * as CountrySelectExamples from '../../components/CountrySelect/CountrySelect.example';

// Select Examples
import * as SelectExamples from '../../components/Select/Select.example';

// Notification Examples
import * as NotificationExamples from '../../components/Notification/Notification.example';

/**
 * Component Examples Configuration
 * 
 * To add a new component example:
 * 1. Import the example file: import * as YourComponentExamples from '../../components/YourComponent/YourComponent.example';
 * 2. Add a new entry to the componentSections array below with:
 *    - id: unique identifier
 *    - title: display name
 *    - description: brief description
 *    - icon: emoji or icon
 *    - examples: the imported examples object
 */
const componentSections = [
  {
    id: 'button',
    title: 'Button Component',
    description: 'Customizable button component with multiple variants, icons, and states',
    icon: '🔘',
    examples: ButtonExamples,
  },
  {
    id: 'modal',
    title: 'Modal Component',
    description: 'Fully customizable popup modal with theme support and animations',
    icon: '📦',
    examples: ModalExamples,
  },
  {
    id: 'textbox',
    title: 'TextBox Component',
    description: 'Custom text input with icons, virtual numeric keyboard, and validation',
    icon: '📝',
    examples: TextBoxExamples,
  },
  {
    id: 'countryselect',
    title: 'CountrySelect Component',
    description: 'Country dropdown with flags and ISD codes',
    icon: '🌍',
    examples: CountrySelectExamples,
  },
  {
    id: 'select',
    title: 'Select Component',
    description: 'Multipurpose dropdown component with search and multiple selection',
    icon: '📋',
    examples: SelectExamples,
  },
  {
    id: 'notification',
    title: 'Notification System',
    description: 'Custom toast notifications and confirm dialogs with theme support',
    icon: '🔔',
    examples: NotificationExamples,
  },
];

function ComponentsExample() {
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedExample, setSelectedExample] = useState(null);

  // Get all example functions from a section
  const getExampleFunctions = (examples) => {
    return Object.keys(examples)
      .filter(key => typeof examples[key] === 'function')
      .map(key => ({
        name: key,
        component: examples[key],
      }));
  };

  // Render selected example
  const renderSelectedExample = () => {
    if (!selectedSection || !selectedExample) return null;

    const section = componentSections.find(s => s.id === selectedSection);
    if (!section) return null;

    const example = getExampleFunctions(section.examples).find(
      e => e.name === selectedExample
    );
    if (!example) return null;

    const ExampleComponent = example.component;

    return (
      <div className="example-viewer">
        <div className="example-header">
          <h3>{example.name.replace(/([A-Z])/g, ' $1').trim()}</h3>
          <button
            className="example-close-btn"
            onClick={() => {
              setSelectedExample(null);
              setSelectedSection(null);
            }}
          >
            ×
          </button>
        </div>
        <div className="example-content">
          <ExampleComponent />
        </div>
      </div>
    );
  };

  return (
    <div className="admin-page components-example-page">
      <div className="page-header">
        <div className="page-header-left">
          <FiCode className="page-icon" />
          <h2>Component Examples</h2>
        </div>
      </div>

      {selectedExample ? (
        renderSelectedExample()
      ) : (
        <div className="components-grid">
          {componentSections.map((section) => {
            const examples = getExampleFunctions(section.examples);

            return (
              <div key={section.id} className="component-card">
                <div className="component-card-header">
                  <span className="component-icon">{section.icon}</span>
                  <h3>{section.title}</h3>
                </div>
                <p className="component-description">{section.description}</p>
                <div className="component-examples-list">
                  <h4>Examples ({examples.length}):</h4>
                  <ul>
                    {examples.map((example) => (
                      <li
                        key={example.name}
                        className="example-item"
                        onClick={() => {
                          setSelectedSection(section.id);
                          setSelectedExample(example.name);
                        }}
                      >
                        <span>{example.name.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <FiChevronRight />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ComponentsExample;
