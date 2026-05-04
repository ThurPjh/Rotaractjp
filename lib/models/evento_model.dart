import 'package:cloud_firestore/cloud_firestore.dart';

class Evento {
  final String id;
  final String nome;
  final String descricao;
  final String data;
  final List<String> presencas;

  Evento({
    required this.id,
    required this.nome,
    required this.descricao,
    required this.data,
    required this.presencas,
  });

  factory Evento.fromFirestore(DocumentSnapshot doc) {
    final dataMap = doc.data() as Map<String, dynamic>?;

    return Evento(
      id: doc.id,
      nome: dataMap?['nome'] ?? 'Evento sem nome',
      descricao: dataMap?['descricao'] ?? '',
      data: dataMap?['data'] ?? '',
      // Garante que a lista de presenças nunca seja nula
      presencas: List<String>.from(dataMap?['presencas'] ?? []),
    );
  }
}