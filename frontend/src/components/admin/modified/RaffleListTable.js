// Simplified RaffleListTable.js 
import React, { useState, useEffect } from 'react'; 
import { FaEdit, FaTrash, FaCheckCircle, FaPlay, FaArchive, FaSync } from 'react-icons/fa'; 
 
const RaffleListTable = ({ raffles, onPromote, onDemote, onSetToDraft, onEdit, onDelete, isSubmitting }) =
  // Simplified implementation 
