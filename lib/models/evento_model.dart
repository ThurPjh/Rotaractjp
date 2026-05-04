import 'package:cloud_firestore/cloud_firestore.dart';

class EventoModel {
  final String id;
  final String titulo;
  final String local;
  final DateTime data;
  final bool estaAberto;

  EventoModel({
    required this.id,
    required this.titulo,
    required this.local,
    required this.data,
    required this.estaAberto,
  });

  factory EventoModel.fromMap(Map<String, dynamic> data, String documentId) {
    return EventoModel(
      id: documentId,
      titulo: data['titulo'] ?? '',
      local: data['local'] ?? '',
      data: (data['data'] as Timestamp).toDate(),
      estaAberto: data['esta_aberto'] ?? false,
    );
  }
}