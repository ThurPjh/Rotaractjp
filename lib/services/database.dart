import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/evento_model.dart'; 

class DatabaseService {
  final CollectionReference eventosCollection = FirebaseFirestore.instance
      .collection('eventos');

  Future<void> addEvento(String nome, String descricao, DateTime data) async {
    await eventosCollection.add({
      'nome': nome,
      'descricao': descricao,
      'data': data,
      'criadoEm': FieldValue.serverTimestamp(),
    });
    // Removendo o 'return' antes do 'await', o erro desaparece!
  }

  // Retorna uma lista de objetos Evento em tempo real
  Stream<List<Evento>> get eventos {
    return eventosCollection.orderBy('data', descending: false).snapshots().map(
      (snapshot) {
        return snapshot.docs.map((doc) => Evento.fromFirestore(doc)).toList();
      },
    );
  }
}
